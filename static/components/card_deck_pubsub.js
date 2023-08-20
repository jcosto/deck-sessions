app.component('card-deck', {
    props: {
        deck: {},
    },
    template:
    `
    <div class="card-deck sticky-bottom" style="display:inline-block;">
        <div v-if="deck.length > 0">
            <card-card
                v-for="(card, cardIndex) in [deck[deck.length-1]]"
                :key="card.id"
                :card="card"
                :cardlocation="'deck'"
                :cardshown="card.shown"
                @move-card="move_card"
                @card-shown-changed="cardShownChanged"
                style="z-index: 10;"
            ></card-card>
        </div>
        <div id="deckActions" class="p-2 pt-0" style="display:inline-block;">
            <a class="m-1"
                data-bs-toggle="collapse" data-bs-target="#collapseDeckActions" href="#collapseDeckActions" role="button" aria-expanded="false" aria-controls="collapseDeckActions"
                style="display:inline-block;">
                <i class="fa-solid fa-grip"></i>
            </a>
            <div class="collapse" id="collapseDeckActions" >
                <a href="#" class="text-warning m-1" @click="shuffleDeck">
                    <i class="fa-solid fa-shuffle"></i>
                </a>
                <a href="#" class="text-warning m-1" @click="resetDeck">
                    <i class="fa-solid fa-rotate"></i>
                </a>
            </div>
        </div>
    </div>
    `,
    data() {
        return {
            
        }
    },
    methods: {
        cardShownChanged(card, sendEvent=true){
            sendEvent ? this.$emit('card-shown-changed', card) : null
        },
        move_card(card, source, destination, sendEvent=true){
            sendEvent ? this.$emit('move-card', card, source, destination) : null
        },
        shuffleDeck() {
            this.$emit('shuffle-deck')
        },
        resetDeck() {
            this.$emit('reset-deck')
        }
    }
})
