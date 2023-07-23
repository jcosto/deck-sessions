function flipCard(e) {
    e.getElementsByClassName('card')[0].classList.toggle('flipped')
}

app.component('card-card', {
    props: {
        card: {},
        cardlocation: {},
        cardshown: {}
    },
    template: 
    `
    <div class="card-container-container">
        <div class="card-container" @click="toggleCardShown">
            <div class="card" :class="{ flipped: cardshown }" >
                <div class="front"></div>
                <div class="back">{{card.value+card.suit}}</div>
            </div>
        </div>
        <button @click="dealToLocation('table')" v-if="cardlocation!=='table'">Set on table</button>
        <button @click="dealToLocation('deck')" v-if="cardlocation!=='deck'">Return to deck</button>
    </div>
    `,
    methods: {
        toggleCardShown() {
            this.card.shown = !this.card.shown
            this.$emit('card-shown-changed', this.card)
        },
        dealToLocation(location) {
            this.$emit('move-card', this.card, this.cardlocation, location)
        }
    },
})