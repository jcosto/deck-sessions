const socket = io();
socket.on('connect', function() {
    socket.emit('my event', {data: 'I\'m connected!'});
});

const app = Vue.createApp({
    data() {
        return {
            joinSessionID: null,
            sessions: [],
            userID: null
        }
    },
    methods: {
        createSession() {
            const sessionID = 'session'+Math.floor(2000000 * Math.random())
            this.joinSession(sessionID)
        },
        joinSession(sessionID) {
            if (!this.userID) {
                this.userID = 'user'+Math.floor(2000000 * Math.random())
            }

            this.sessions.push(sessionID)
            
            socket.emit('join', {sessionID: sessionID, userID: this.userID})
        },
        deckInitialized(sessionID) {
            console.log('deck initialized for ' + sessionID)
            socket.emit('deck-initialized', {
                sessionID: sessionID,
                userID: this.userID
            });
        },
        deckShuffled(sessionID, deck) {
            console.log('deck shuffled for ' + sessionID)
            console.log(deck)
            socket.emit('deck-shuffled', {
                sessionID: sessionID,
                deck: deck,
                userID: this.userID
            });
        },
        cardShownChanged(sessionID, card){
            console.log('card-shown-changed', card)
            socket.emit('card-shown-changed', {
                sessionID: sessionID,
                card: card,
                userID: this.userID
            });
        },
        cardMoved(sessionID, card, source, destination){
            console.log("card-moved", card,source, destination)
            socket.emit('card-moved', {
                sessionID: sessionID,
                card: card,
                source: source,
                destination: destination,
                userID: this.userID
            });
        }
    }
})

