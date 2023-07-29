const socket = io();
socket.on('connect', function() {
    socket.emit('loginevent', {data: 'I\'m connected!'});
});

async function pubsub() {
    let messages = document.querySelector('#messages');
    let res = await fetch(`${window.location.origin}/api/negotiate`);
    let url = await res.json();
    let ws = new WebSocket(url.url);
    ws.onopen = () => console.log('connected');

    ws.onmessage = event => {
        let m = document.createElement('p');
        m.innerText = event.data;
        messages.appendChild(m);
    };
}();

const app = Vue.createApp({
    data() {
        return {
            sessionid_: 'session'+Math.floor(2000000 * Math.random()),
            userid_: 'user'+Math.floor(2000000 * Math.random()),
            values: ['A',2,3,4,5,6,7,8,9,10,'J','Q','K'],
            values_icons: [null,null,null,null,null,null,null,null,null,null,'chess-knight','chess-queen','crown'],
            suits: ["C","S","H","D"],
            suits_icons: ["clover","trowel","heart","diamond"],
            cards_: {},
            stacks_: {}
        }
    },
    mounted() {
        this.handleChangedJoinSessionID(this.sessionid_)
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

            sendEvent ? socket.emit('card-moved', {
                sessionID: this.sessionid_,
                card: card,
                source: source,
                destination: destination,
                userID: this.userid_
            }) : null
        },
        changeCardLocation(cardid, location_dst, sendEvent=true) {
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
        shuffleDeck(sendEvent=true) {
            shuffleArray(this.stacks_["deck"]).forEach(
                (c,i) => {
                    c.seq = i
                }
            )
            console.log(this.stacks_["deck"])

            const cobj = {}
            Object.entries(this.cards_).forEach((kc => {
                cobj[kc[0]]=kc[1]
            }))
            sendEvent ? socket.emit('deck-shuffled', {
                sessionID: this.sessionid_,
                userID: this.userid_,
                cards: cobj
            }) : null
        },
        handeCardShownChanged(card) {
            console.log('card-shown-changed', card)
            socket.emit('card-shown-changed', {
                sessionID: this.sessionid_,
                card: card,
                userID: this.userid_
            });
        },
        getAllStacks() {
            const locations = []
            for (let k in this.cards_) {
                if (!locations.includes(this.cards_[k].location)) {
                    locations.push(this.cards_[k].location)
                }
            }
            locations.forEach(location => {
                this.getStack(location)
            })
        },
        handleChangedJoinSessionID(joinSessionID) {
            this.sessionid_ = joinSessionID
            socket.emit('join', {sessionID: this.sessionid_, userID: this.userid_})
            socket.on('server-deck-state', (data) => {
                if (data.userID!==this.userid_) {
                    console.log("received server-deck-state event from other user")
                }
            })
            socket.on('server-deck-initialized', (data) => {
                console.log(data)
                if (data.userID!==this.userid_) {
                    console.log("received server-deck-initialized event from other user")
                    // reflect cards from socket to ui
                    for (let cardid in data.cards) {
                        this.cards_[cardid] = data.cards[cardid]
                    }
                    this.getAllStacks()
                }
            })
            socket.on('server-deck-shuffled', (data) => {
                if (data.userID!==this.userid_) {
                    console.log("received server-deck-shuffled event from other user")
                    // reflect cards from socket to ui
                    console.log(data.cards)
                    for (let cardid in data.cards) {
                        this.cards_[cardid] = data.cards[cardid]
                    }
                    this.getAllStacks()
                }
            })
            socket.on('server-card-shown-changed', (data) => {
                if (data.userID!==this.userid_) {
                    console.log("received server-card-shown-changed event from other user")
                    this.cards_[data.card.id].shown = data.card.shown
                }
            })
            socket.on('server-card-moved', (data) => {
                if (data.userID!==this.userid_) {
                    console.log("received server-card-moved event from other user")
                    this.move_card(data.card, data.source, data.destination, sendEvent=false)
                }
            })
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

                socket.emit('deck-initialized', {
                    sessionID: this.sessionid_,
                    userID: this.userid_,
                    cards: cards_
                });
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