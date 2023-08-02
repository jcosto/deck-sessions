document.addEventListener('app-configured', () => {
    app.component('card-table', {
        props: {
            sessionid: {},
            deck: {},
            table: {},
            userid: {}
        },
        template:
        `
        <div class="card-session">
            <h1>
                Session
                <button @click="showSessionIDInput" v-if="!showJoinSessionID">{{sessionid}}</button>
                <input type="text" v-model="newSessionID" v-if="showJoinSessionID" @change="handleChangedJoinSessionID" @blur="hideSessionIDInput">
            </h1>
            <div class="table">
                <div class="row">
                    <div class="col-2">
                        <h1>Deck ({{deck.length}}) <button @click="shuffleDeck">Shuffle Deck</button></h1>
                        <div v-if="deck.length > 0">
                            <card-card
                                v-for="(card, cardIndex) in [deck[deck.length-1]]"
                                :key="card.id"
                                :card="card"
                                :cardlocation="'deck'"
                                :cardshown="card.shown"
                                @move-card="move_card"
                                @card-shown-changed="cardShownChanged"
                            ></card-card>
                        </div>
                    </div>
                    <div class="col-10">
                        <h1>Table ({{table.length}})</h1>
                        <div v-if="table.length > 0">
                            <card-card
                                v-for="(card, cardIndex) in table"
                                :key="card.id"
                                :card="card"
                                :cardlocation="'table'"
                                :cardshown="card.shown"
                                @move-card="move_card"
                                @card-shown-changed="cardShownChanged"
                            ></card-card>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        `,
        data() {
            return {
                showJoinSessionID: false,
                newSessionID: null,
            }
        },
        methods: {
            showSessionIDInput() {
                this.newSessionID = this.sessionid
                this.showJoinSessionID = true
                console.log("showSessionIDInput", this.showJoinSessionID)
            },
            hideSessionIDInput() {
                this.showJoinSessionID = false
                console.log("hideSessionIDInput", this.showJoinSessionID)
            },
            handleChangedJoinSessionID() {
                console.log("changed-session-id", this.newSessionID)
                this.$emit("changed-session-id", this.newSessionID)
                this.showJoinSessionID = false
            },
            cardShownChanged(card, sendEvent=true){
                sendEvent ? this.$emit('card-shown-changed', card) : null
            },
            move_card(card, source, destination, sendEvent=true){
                sendEvent ? this.$emit('move-card', card, source, destination) : null
            },
            shuffleDeck() {
                this.$emit('shuffle-deck')
            }
        }
    })
    
})
