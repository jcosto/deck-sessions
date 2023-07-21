app.component('card-table', {
    props: {
        sessionid: {
            type: String,
            required: true,
        }
    },
    template:
    `
    <div class="card-session">
        <button v-if="!sessionStarted" @click="startSession">Start session {{sessionid}}</button>
        <div v-else>
            <h1>Deck</h1>
            <div class="card-deck">
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
        shuffleDeck() {
            this.deck = shuffleArray(this.deck)
            this.$emit('deck-shuffled', this.sessionid, this.deck)
        },
        initializeDeck() {
            const deck = []
            this.suits.forEach(s => {
                this.values.forEach(v => {
                    deck.push({
                        id: ''+v+s,
                        suit: s,
                        value: v,
                        shown: false
                    })
                }) 
            });
            this.deck = deck
            this.$emit('deck-initialized', this.sessionid)
        },
        dealCard() {
            const card = this.deck.pop()
            this.hand.push(card)
            this.$emit("card-moved", card, "hand")
        },
        dealCardToTable() {
            const card = this.deck.pop()
            this.table.push(card)
            this.$emit("card-moved", card, "table")
        },
        dealHandToTable(cardIndex) {
            const card = this.hand[cardIndex]
            this.table.push(card)
            this.hand = this.hand.filter((c,i) => i !== cardIndex)
            this.$emit("card-moved", card, "table")
        },
        dealTableToHand(cardIndex) {
            const card = this.table[cardIndex]
            card.shown = false
            this.hand.push(card)
            this.table = this.table.filter((c,i) => i !== cardIndex)
            this.$emit("card-moved", card, "hand")
        },
        cardShownChanged(card){
            this.$emit('card-shown-changed', card)
        },
        moveCard(card, source, destination){
            console.log("moveCard", card, source, destination)
            if (source === "hand" && destination === "table") {
                this.dealHandToTable(this.hand.map((c, i) => c.id === card.id ? i : null).filter(i => i !== null)[0])
            } else if (source === "table" && destination === "hand") {
                this.dealTableToHand(this.table.map((c, i) => c.id === card.id ? i : null).filter(i => i !== null)[0])
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
  