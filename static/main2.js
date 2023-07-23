const app = Vue.createApp({
    data() {
        return {
            sessionid_: 'session'+Math.floor(2000000 * Math.random()),
            values: ['A',2,3,4,5,6,7,8,9,10,'J','Q','K'],
            values_icons: [null,null,null,null,null,null,null,null,null,null,'chess-knight','chess-queen','crown'],
            suits: ["C","S","H","D"],
            suits_icons: ["clover","trowel","heart","diamond"],
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
            this.cards_[cardid].seq = Math.max.apply(null,Object.entries(this.cards_).map(kc=>kc[1].seq))+1
            this.stacks_[location_dst].sort((a,b) => a.seq-b.seq)
            
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
                this.suits.forEach((s, sidx) => {
                    this.values.forEach((v, vidx) => {
                        const c = {
                            id: ''+v+s,
                            suit: s,
                            suit_icon: this.suits_icons[sidx],
                            value: v,
                            value_icon: this.values_icons[vidx],
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
            return "deck" in this.stacks_ ? this.stacks_["deck"] : []
        },
        table() {
            return "table" in this.stacks_ ? this.stacks_["table"] : []
        },
        hand() {
            return "hand" in this.stacks_ ?  this.stacks_["hand"] : []
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