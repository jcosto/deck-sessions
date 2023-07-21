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
        },
        deckShuffled(sessionID, deck) {
            console.log('deck shuffled for ' + sessionID)
            console.log(deck)
        },
        cardShownChanged(card){
            console.log('card-shown-changed', card)
        },
        cardMoved(card, destination){
            console.log("card-moved", card, destination)
        }
    }
})