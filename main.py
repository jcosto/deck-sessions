from flask import Flask, render_template
from flask_socketio import SocketIO

app = Flask(__name__)
app.config['SECRET_KEY'] = 'secret!'
socketio = SocketIO(app)

@app.route("/")
def home():
    return render_template('index.html')

@socketio.on('my event')
def handle_my_custom_event(json):
    print('received json: ' + str(json))

from flask_socketio import send, emit, join_room

@socketio.on('join')
def on_join(data):
    room = data["sessionID"]
    user = data["userID"]
    join_room(room)
    send(user + ' joined the room ' + room, to=room)

@socketio.on('deck-initialized')
def handle_deck_initialized(json):
    print('deck-initialized received json: ' + str(json))
    
    room = json["sessionID"]
    emit('server-deck-initialized', json, to=room)

@socketio.on('deck-shuffled')
def handle_deck_shuffled(json):
    print('deck-shuffled received json: ' + str(json))
    
    room = json["sessionID"]
    emit('server-deck-shuffled', json, to=room)

@socketio.on('card-shown-changed')
def handle_deck_shuffled(json):
    print('card-shown-changed received json: ' + str(json))

    room = json["sessionID"]
    emit('server-card-shown-changed', json, to=room)

@socketio.on('card-moved')
def handle_deck_shuffled(json):
    print('card-moved received json: ' + str(json))

    room = json["sessionID"]
    emit('server-card-moved', json, to=room)

if __name__ == '__main__':
    socketio.run(app)
