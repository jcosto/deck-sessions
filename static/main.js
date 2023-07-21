const socket = io();
socket.on('connect', function() {
    socket.emit('my event', {data: 'I\'m connected!'});
});

const app = Vue.createApp({
    data() {
        return {
            sessions: []
        }
    },
    methods: {
        createSession() {
            this.sessions.push('session'+Math.floor(32767 * Math.random()))
        },
        deckInitialized(sessionID) {
            console.log('deck initialized for ' + sessionID)
            socket.emit('deck-initialized', {sessionID: sessionID});
        },
        deckShuffled(sessionID, deck) {
            console.log('deck shuffled for ' + sessionID)
            console.log(deck)
            socket.emit('deck-shuffled', {
                sessionID: sessionID,
                deck: deck
            });
        },
        cardShownChanged(sessionID, card){
            console.log('card-shown-changed', card)
            socket.emit('card-shown-changed', {
                sessionID: sessionID,
                card: card
            });
        },
        cardMoved(sessionID, card, destination){
            console.log("card-moved", card, destination)
            socket.emit('card-moved', {
                sessionID: sessionID,
                card: card,
                destination: destination
            });
        }
    }
})

