function flipCard(e) {
    e.getElementsByClassName('card')[0].classList.toggle('flipped')
}

app.component('card-card', {
    props: {
        card: {}
    },
    template: 
    `
    <div class="container" @click="toggleCardShown">
        <div class="card" :class="{ flipped: card.shown }" >
            <div class="front">Hidden</div>
            <div class="back">{{card.value+card.suit}}</div>
        </div>
    </div>
    `,
    methods: {
        toggleCardShown() {
            this.card.shown = !this.card.shown
            this.$emit('card-shown-changed', this.card)
        }
    }
})