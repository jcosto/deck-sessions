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
    <div class="card-container-container" style="position:relative;">
        <div class="card-container" @click="toggleCardShown">
            <div class="card" :class="{ flipped: cardshown }" >
                <div class="front"></div>
                <div class="back">
                    <h1 :class="card.suit=='H' || card.suit=='D' ? 'text-danger' : 'text-dark'">
                        <i v-if="!!card.value_icon" class="fa-solid" :class="'fa-'+card.value_icon"></i>
                        <span v-else>
                            {{card.value}}
                        </span>
                        <i v-if="!!card.suit_icon" class="fa-solid" :class="'fa-'+card.suit_icon"></i>
                    </h1>
                </div>
            </div>
        </div>
        <button
            class="btn btn-primary" style="position:absolute;bottom:0px;left:0px;"
            @click="dealToLocation('table')" v-if="cardlocation!=='table'"
            >
            <i class="fa-solid fa-angle-down"></i>
        </button>
        <button
            class="btn btn-primary" style="position:absolute;top:0px;right:0px;"
            @click="dealToLocation('deck')" v-if="cardlocation!=='deck'"
            >
            <i class="fa-solid fa-angle-up"></i>
        </button>
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
