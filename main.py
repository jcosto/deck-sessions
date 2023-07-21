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

@socketio.on('deck-initialized')
def handle_deck_initialized(json):
    print('deck-initialized received json: ' + str(json))

@socketio.on('deck-shuffled')
def handle_deck_shuffled(json):
    print('deck-shuffled received json: ' + str(json))

@socketio.on('card-shown-changed')
def handle_deck_shuffled(json):
    print('card-shown-changed received json: ' + str(json))

@socketio.on('card-moved')
def handle_deck_shuffled(json):
    print('card-moved received json: ' + str(json))

if __name__ == '__main__':
    socketio.run(app)
