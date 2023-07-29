from flask import Flask, render_template, jsonify, request
from secrets import token_hex
app = Flask(__name__)
app.config['SECRET_KEY'] = token_hex(32)

from azure.messaging.webpubsubservice import WebPubSubServiceClient

from dotenv import load_dotenv
load_dotenv(".env")
import os
PB_SERVICE: WebPubSubServiceClient = WebPubSubServiceClient.from_connection_string(connection_string=os.environ["WebPubSubConnectionString"], hub="decksessions")

@app.route("/")
def home():
    return render_template('index-azurewebpubsub.html')

@app.route("/api/negotiate", methods=["GET"])
def negotiate():
    user_id = request.args["userID"]
    room = request.args["sessionID"]
    token = PB_SERVICE.get_client_access_token(
        user_id=user_id,
        roles=[f"webpubsub.joinLeaveGroup.{room}",
            f"webpubsub.sendToGroup.{room}"])
    return jsonify({"url": token['url']})

@app.route('/message/loginevent')
def handle_my_custom_event(data):
    user = data["userID"]
    message = "user logged in %s" % (user,)
    PB_SERVICE.send_to_all(message, content_type="text/plain")
    print(message)

@app.route('/message/join')
def on_join(data):
    room = data["sessionID"]
    user = data["userID"]
    message = user + ' joined the room ' + room
    PB_SERVICE.add_user_to_group(room, user)
    PB_SERVICE.send_to_group(room, message, content_type="text/plain")
    print(user + ' joined the room ' + room)

@app.route('/message/deck-initialized')
def handle_deck_initialized(json):
    print('deck-initialized received json: ' + str(json))
    
    room = json["sessionID"]
    emit('server-deck-initialized', json, to=room)

@app.route('/message/deck-shuffled')
def handle_deck_shuffled(json):
    print('deck-shuffled received json: ' + str(json))
    
    room = json["sessionID"]
    emit('server-deck-shuffled', json, to=room)

@app.route('/message/card-shown-changed')
def handle_card_shown_changed(json):
    print('card-shown-changed received json: ' + str(json))

    room = json["sessionID"]
    emit('server-card-shown-changed', json, to=room)

@app.route('/message/card-moved')
def handle_card_moved(json):
    print('card-moved received json: ' + str(json))

    room = json["sessionID"]
    emit('server-card-moved', json, to=room)

def run():
    app.run(debug=True)

if __name__ == '__main__':
    run()
