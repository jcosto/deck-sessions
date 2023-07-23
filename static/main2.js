const app = Vue.createApp({
    data() {
        return {
            sessionid_: 'session'+Math.floor(2000000 * Math.random()),
            values: ['A',2,3,4,5,6,7,8,9,10,'J','Q','K'],
            suits: ["C","S","H","D"],
            cards_: {},
            stacks_: {}
        }
    },
    methods: {
        getStack(location) {
            const d = []
            for (let k in this.cards_){
                if (this.cards_[k].location === location) {
                    d.push(this.cards_[k])
                }
            }
            d.sort((a,b) => a.seq-b.seq)
            this.stacks_[location] = d
            return d
        }, 
        move_card(card, source, destination, sendEvent=true){
            console.log("move_card", card, source, destination)
            this.changeCardLocation(card.id, destination)
        },
        changeCardLocation(cardid, location_dst) {
            console.log("changeCardLocation", cardid, location_dst)
            const location_src = this.cards_[cardid].location
            
            this.stacks_[location_dst] = Object.entries(this.cards_)
                .filter(kc=>kc[1].location==location_dst)
                .map(kc=>kc[1])
            this.stacks_[location_dst].push(this.cards_[cardid])
            this.cards_[cardid].location = location_dst
            console.log(
                Object.entries(this.cards_).map(kc=>kc[1].seq),
                Math.max.apply(null,Object.entries(this.cards_).map(kc=>kc[1].seq)),
                Math.max.apply(null,Object.entries(this.cards_).map(kc=>kc[1].seq))+1
            )
            this.cards_[cardid].seq = Math.max.apply(null,Object.entries(this.cards_).map(kc=>kc[1].seq))+1
            this.stacks_[location_dst].sort((a,b) => a.seq-b.seq)
            console.log(
                Object.entries(this.cards_).map(kc=>kc[1].seq),
                Math.max.apply(null,Object.entries(this.cards_).map(kc=>kc[1].seq)),
            )
            console.log(this.cards_[cardid])
            
            this.stacks_[location_src] = Object.entries(this.cards_)
                .filter(kc=>kc[1].location==location_src)
                .map(kc=>kc[1])
            this.stacks_[location_src].sort((a,b) => a.seq-b.seq)
        },
        shuffleDeck() {
            shuffleArray(this.stacks_["deck"]).forEach(
                (c,i) => {
                    c.seq = i
                }
            )
            console.log(this.stacks_["deck"])
        },
    },
    computed: {
        cards() {
            if (Object.entries(this.cards_).length == 0) {
                const cards_ = []
                let count = 0
                this.suits.forEach(s => {
                    this.values.forEach(v => {
                        const c = {
                            id: ''+v+s,
                            suit: s,
                            value: v,
                            shown: false,
                            location: "deck",
                            seq: count
                        }
                        count += 1
                        cards_[c.id] = c
                    }) 
                });
                this.cards_=cards_
                this.getStack("deck")
            }
            return this.cards_
        },
        deck() {
            return this.stacks_["deck"]
        },
        table() {
            return this.stacks_["table"]
        },
        hand() {
            return this.stacks_["hand"]
        }
    }
})
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}