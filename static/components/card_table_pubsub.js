app.component('card-table', {
    props: {
        table: {},
    },
    template:
    `
    <div class="card-table">
        <div class="table">
            <div class="row">
                <div class="col">
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
        return {}
    },
    methods: {
        cardShownChanged(card, sendEvent=true){
            sendEvent ? this.$emit('card-shown-changed', card) : null
        },
        move_card(card, source, destination, sendEvent=true){
            sendEvent ? this.$emit('move-card', card, source, destination) : null
        },
    }
})
