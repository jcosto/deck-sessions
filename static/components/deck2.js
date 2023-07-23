app.component('card-table', {
    props: {
        sessionid: {},
        deck: {},
        table: {}
    },
    template:
    `
    <div class="card-session">
        <h1>Session {{sessionid}}</h1>
        <div class="table">
            <div class="row">
                <div class="col">
                    <h1>Deck</h1>
                    <card-card
                        v-for="(card, cardIndex) in deck"
                        :key="card.id"
                        :card="card"
                        :cardlocation="'deck'"
                        :cardshown="card.shown"
                        @move-card="move_card"
                    ></card-card>
                </div>
                <div class="col">
                    <h1>Table</h1>
                    <card-card
                        v-for="(card, cardIndex) in table"
                        :key="card.id"
                        :card="card"
                        :cardlocation="'table'"
                        :cardshown="card.shown"
                        @move-card="move_card"
                    ></card-card>
                </div>
            </div>
        </div>
    </div>
    `,
    data() {
        return {}
    },
    methods: {
        cardShownChanged(card, sendEvent=true){
            sendEvent ? this.$emit('card-shown-changed', this.sessionid, card) : null
        },
        move_card(card, source, destination, sendEvent=true){
            sendEvent ? this.$emit('move-card', card, source, destination) : null
        }
    }
})
