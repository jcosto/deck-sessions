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
        <button @click="dealToTable" v-if="cardlocation!=='table'">Set on table</button>
    </div>
    `,
    methods: {
        toggleCardShown() {
            this.card.shown = !this.card.shown
            this.$emit('card-shown-changed', this.card)
        },
        dealToTable() {
            this.$emit('move-card', this.card, this.cardlocation, "table")
        },
        dealToHand() {
            this.$emit('move-card', this.card, this.cardlocation, "hand")
        }
    },
})