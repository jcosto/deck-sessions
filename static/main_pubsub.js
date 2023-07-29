const SESSIONID = !!new URL(window.location).searchParams.get("sessionID") ?
    new URL(window.location).searchParams.get("sessionID") :
    'session'+Math.floor(2000000 * Math.random())
const USERID = 'user'+Math.floor(2000000 * Math.random())
let WS = null;

function uuidv4() {
    return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
      (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
    );
  }
  
const ws_configured_event = new Event("ws-configured");


(async function setWS() {
    let res = await fetch(`${window.location.origin}/api/negotiate?userID=${USERID}&sessionID=${SESSIONID}`)
    let data = await res.json()
    // console.log(data.url)
    let ws = new WebSocket(data.url, 'json.webpubsub.azure.v1')
    ws.onopen = (e) => {
        console.log(e)
        console.log('[open] Connection established')
        ws.send(JSON.stringify({
            type: 'joinGroup',
            group: SESSIONID
        }));

        ws.send(JSON.stringify(
            {
                type: 'sendToGroup',
                group: SESSIONID,
                dataType: 'json',
                data: {userID: USERID},
                ackId: Math.floor(2000000 * Math.random())
            }
        ))
        
        
    };

    ws.onclose = (event) => {
        if (event.wasClean) {
            console.log(`[close] Connect closed cleanly, code=${event.code} reason=${event.reason}`);
        } else {
            alert('[close] Connection died')
            console.error(`[close] Connect closed with error, code=${event.code} reason=${event.reason}`)
        }
    }
    
    ws.onerror = (error) => {
        console.error(error)
    }

    ws.onmessage = event => {
        // console.log("message from server:", event.data)
        let message = JSON.parse(event.data)
        if (message.type === "message" && message.group===SESSIONID) {
            if (message.data.userID !== USERID) {
                console.log("message found", message.data)
            }
        }
    };

    
    WS = ws;
    console.log("set WS");
    
    document.dispatchEvent(ws_configured_event)

    

    
})();

let app = null;

const app_configured_event = new Event("app-configured");

document.addEventListener('ws-configured', () => {
    app = Vue.createApp({
        data() {
            return {
                sessionid_: SESSIONID,
                userid_: USERID,
                values: ['A',2,3,4,5,6,7,8,9,10,'J','Q','K'],
                values_icons: [null,null,null,null,null,null,null,null,null,null,'chess-knight','chess-queen','crown'],
                suits: ["C","S","H","D"],
                suits_icons: ["clover","trowel","heart","diamond"],
                cards_: {},
                stacks_: {},
                ws: null,
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
    
                // sendEvent ? socket.emit('card-moved', {
                //     sessionID: this.sessionid_,
                //     card: card,
                //     source: source,
                //     destination: destination,
                //     userID: this.userid_
                // }) : null
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
                sendEvent ? WS.send(
                    {
                        type: 'sendToGroup',
                        group: SESSIONID,
                        dataType: 'json',
                        data: {
                            event: "deck-shuffled",
                            sessionID: this.sessionid_,
                            userID: this.userid_,
                            cards: cobj
                        },
                        ackId: Math.floor(2000000 * Math.random())
                    }
                ) : null
            },
            handeCardShownChanged(card) {
                console.log('card-shown-changed', card)
                WS.send(
                    {
                        type: 'sendToGroup',
                        group: SESSIONID,
                        dataType: 'json',
                        data: {
                            event: "card-shown-changed",
                            sessionID: this.sessionid_,
                            card: card,
                            userID: this.userid_
                        },
                        ackId: Math.floor(2000000 * Math.random())
                    }
                )
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
            handleChangedJoinSessionID(joinSessionID_) {
                this.sessionid_ = joinSessionID_;
    
                
                
                
                // socket.emit('join', {sessionID: this.sessionid_, userID: this.userid_})
                // socket.on('server-deck-state', (data) => {
                //     if (data.userID!==this.userid_) {
                //         console.log("received server-deck-state event from other user")
                //     }
                // })
                // socket.on('server-deck-initialized', (data) => {
                //     console.log(data)
                //     if (data.userID!==this.userid_) {
                //         console.log("received server-deck-initialized event from other user")
                //         // reflect cards from socket to ui
                //         for (let cardid in data.cards) {
                //             this.cards_[cardid] = data.cards[cardid]
                //         }
                //         this.getAllStacks()
                //     }
                // })
                // socket.on('server-deck-shuffled', (data) => {
                //     if (data.userID!==this.userid_) {
                //         console.log("received server-deck-shuffled event from other user")
                //         // reflect cards from socket to ui
                //         console.log(data.cards)
                //         for (let cardid in data.cards) {
                //             this.cards_[cardid] = data.cards[cardid]
                //         }
                //         this.getAllStacks()
                //     }
                // })
                // socket.on('server-card-shown-changed', (data) => {
                //     if (data.userID!==this.userid_) {
                //         console.log("received server-card-shown-changed event from other user")
                //         this.cards_[data.card.id].shown = data.card.shown
                //     }
                // })
                // socket.on('server-card-moved', (data) => {
                //     if (data.userID!==this.userid_) {
                //         console.log("received server-card-moved event from other user")
                //         this.move_card(data.card, data.source, data.destination, sendEvent=false)
                //     }
                // })
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
    
    
                    WS.send(
                        {
                            type: 'sendToGroup',
                            group: SESSIONID,
                            dataType: 'json',
                            data: {
                                event: "deck-initialized",
                                sessionID: this.sessionid_,
                                userID: this.userid_,
                                cards: cards_
                            },
                            ackId: Math.floor(2000000 * Math.random())
                        }
                    )
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

    document.dispatchEvent(app_configured_event)
})


function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}