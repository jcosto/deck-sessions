app.component('card-table', {
    props: {
        sessionid: {
            type: String,
            required: true,
        },
        userid: {
            type: String,
            required: true,
        },
        joined: {
            type: Boolean,
            required: true,
        }
    },
    template:
    `
    <div class="card-session">
        <button v-if="!sessionStarted && !joined" @click="startSession">Start session {{sessionid}}</button>
        <div v-else>
            {{ joinSession() }}
            <h1>Session {{sessionid}}</h1>
            <h1>Deck</h1>

            <div class="card-deck">
                <button @click="initializeDeck">initializeDeck</button>
                <button @click="shuffleDeck">shuffleDeck</button>
                <button @click="dealCard">Deal Card to Hand</button>
                <button @click="dealCardToTable">Deal Card to Table</button>
            </div>
            
            <h1>Hand</h1>
            <div class="card-hand">
                <card-card
                    v-for="(card, cardIndex) in hand"
                    :key="card.id"
                    :card="card"
                    :cardlocation="'hand'"
                    :cardshown="card.shown"
                    @card-shown-changed="cardShownChanged"
                    @move-card="moveCard"
                ></card-card>
            </div>

            <h1>Table</h1>
            <div class="card-table">
                <card-card
                    v-for="(card, cardIndex) in table"
                    :key="card.id"
                    :card="card"
                    :cardlocation="'table'"
                    :cardshown="card.shown"
                    @card-shown-changed="cardShownChanged"
                    @move-card="moveCard"
                ></card-card>
            </div>
        </div>
    </div>
    `,
    data() {
        return {
            values: ['A',2,3,4,5,6,7,8,9,10,'J','Q','K'],
            suits: ["C","S","H","D"],
            cards: {},
            deck: [],
            hand: [],
            table: [],
            sessionStarted: false
        }
    },
    methods: {
        startSession() {
            this.initializeDeck()
            this.shuffleDeck()
            this.sessionStarted = true
        },
        joinSession() {
            console.log("this.userid", this.userid)
            socket.on('server-deck-state', (data) => {
                if (data.userID!==this.userid) {
                    console.log("received server-deck-state event from other user")
                }
            })
            socket.on('server-deck-initialized', (data) => {
                console.log(data)
                if (data.userID!==this.userid) {
                    console.log("received server-deck-initialized event from other user")
                    this.initializeDeck(sendEvent=false)
                }
            })
            socket.on('server-deck-shuffled', (data) => {
                if (data.userID!==this.userid) {
                    console.log("received server-deck-shuffled event from other user")
                    this.deck = data.deck.map(c => {
                        return this.cards[c.id]
                    })
                }
            })
            socket.on('server-card-shown-changed', (data) => {
                if (data.userID!==this.userid) {
                    console.log("received server-card-shown-changed event from other user")
                    this.cards[data.card.id].shown = data.card.shown
                }
            })
            socket.on('server-card-moved', (data) => {
                if (data.userID!==this.userid) {
                    console.log("received server-card-moved event from other user")
                    this.moveCard(data.card, data.source, data.destination, sendEvent=false)
                }
            })
        },
        shuffleDeck() {
            this.deck = shuffleArray(this.deck)
            console.log(this.deck)
            this.$emit('deck-shuffled', this.sessionid, this.deck)
        },
        initializeDeck(sendEvent=true) {
            const deck = []
            const cards = {}
            this.suits.forEach(s => {
                this.values.forEach(v => {
                    const c = {
                        id: ''+v+s,
                        suit: s,
                        value: v,
                        shown: false
                    }
                    cards[c.id] = c
                    deck.push(cards[c.id])
                }) 
            });
            this.deck = deck
            this.cards = cards

            console.log(this.deck)
            console.log(this.cards)
            
            sendEvent ? this.$emit('deck-initialized', this.sessionid) : null
        },
        transferCard(arr1, location1, arr2, location2, card_, hideCardAfterTransfer=true, sendEvent=true) {
            const card = this.cards[card_.id]
            card.shown = hideCardAfterTransfer ? false : card.shown
            const cardIndex = arr1.indexOf(card)
            if (cardIndex > -1) {
                arr1.splice(cardIndex, 1)
            }
            arr2.push(card)
            
            
            sendEvent ? this.$emit("card-moved", this.sessionid, card, location1, location2) : null
        },
        dealCard(sendEvent=true) {
            this.transferCard(
                this.deck, "deck",
                this.hand, "hand",
                this.deck[this.deck.length-1],
                hideCardAfterTransfer=false,
                sendEvent=sendEvent
            )
        },
        dealCardToTable(sendEvent=true) {
            this.transferCard(
                this.deck, "deck",
                this.table, "table",
                this.deck[this.deck.length-1],
                hideCardAfterTransfer=false,
                sendEvent=sendEvent
            )
        },
        dealHandToTable(cardIndex, sendEvent=true) {
            this.transferCard(
                this.hand, "hand",
                this.table, "table",
                this.hand[cardIndex],
                hideCardAfterTransfer=false,
                sendEvent=sendEvent
            )
        },
        dealTableToHand(cardIndex, sendEvent=true) {
            this.transferCard(
                this.table, "table",
                this.hand, "hand",
                this.table[cardIndex],
                hideCardAfterTransfer=true,
                sendEvent=sendEvent
            )
        },
        cardShownChanged(card, sendEvent=true){
            sendEvent ? this.$emit('card-shown-changed', this.sessionid, card) : null
        },
        moveCard(card, source, destination, sendEvent=true){
            console.log("moveCard", card, source, destination)
            if (
                (source === "hand" && destination === "table") ||
                (source === "table" && destination === "hand") ||
                (source === "deck" && destination === "hand") ||
                (source === "deck" && destination === "table")
            ) {
                const sourceArr = source === "deck" ? this.deck : (
                    source === "hand" ? this.hand : (
                        source === "table" ? this.table : null
                    )
                )
                const destinationArr = destination === "deck" ? this.deck : (
                    destination === "hand" ? this.hand : (
                        destination === "table" ? this.table : null
                    )
                )
                this.transferCard(
                    sourceArr, source,
                    destinationArr, destination,
                    card,
                    hideCardAfterTransfer=(source === "table" && destination === "hand"),
                    sendEvent=sendEvent
                )
            } else {
                console.log("invalid move", card, source, destination)
            }
        }
    },
    computed: {

    }
  })

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}
  