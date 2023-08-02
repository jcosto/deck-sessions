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

def run():
    app.run(debug=True)

if __name__ == '__main__':
    run()
