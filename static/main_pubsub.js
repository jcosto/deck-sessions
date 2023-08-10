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
const ws_opened_event = new Event("ws-opened");

class PubSubHandler {
    constructor() {
        this.ws = null
    }
    async setWS() {
        let res = await fetch(`${window.location.origin}/api/negotiate?userID=${USERID}&sessionID=${SESSIONID}`)
        let data = await res.json()
        // console.log(data.url)
        let ws = new WebSocket(data.url, 'json.webpubsub.azure.v1')
        ws.onopen = (e) => {
            document.dispatchEvent(ws_opened_event)
    
            console.log(e)
            console.log('[open] Connection established')
            
            // ws.send(JSON.stringify({
            //     type: 'joinGroup',
            //     group: SESSIONID
            // }));
    
        };
    
        ws.onclose = (event) => {
            if (event.wasClean) {
                console.log(`[close] Connect closed cleanly, code=${event.code} reason=${event.reason}`);
            } else {
                alert('[close] Connection died')
                console.error(`[close] Connect closed with error, code=${event.code} reason=${event.reason}`)
            }
            document.dispatchEvent(new Event("ws-closed"))
        }
        
        ws.onerror = (error) => {
            console.log(error)
        }
    
        ws.onmessage = event => {
            // console.log("message from server:", event.data)
            let message = JSON.parse(event.data)
            if (message.type === "message" && message.group===SESSIONID) {
                if (message.data.userID !== USERID) {
                    console.log("message found", message.data)
                    document.dispatchEvent(
                        new CustomEvent("server-"+message.data.event, {detail: message.data})
                    )
                    console.log("sent event: server-"+message.data.event)
                    
                } else {
                    // console.log("message found from me", message.data)
                }
            }
            return false
        };
    
        
        this.ws = ws
        console.log("set WS");
        
        document.dispatchEvent(ws_configured_event)
    
    }
    async sendData (sessionid_, data) {
        if (this.ws === null) {

        } else {
            this.ws.send(JSON.stringify(
                {
                    type: 'sendToGroup',
                    group: sessionid_,
                    dataType: 'json',
                    data: data,
                    ackId: Math.floor(2000000 * Math.random())
                }
            ))
        }
    }
    async joinGroup(sessionid_) {
        if (this.ws === null) {

        } else {
            this.ws.send(JSON.stringify({
                type: 'joinGroup',
                group: sessionid_
            }));
        }
    }
}

const psh = new PubSubHandler()
psh.setWS().catch(e =>{
    console.error(e)
})

const app = Vue.createApp({
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
            allowCardsGenerate: false,
            allowCardStateReponse: false,
            countReceivedCardStateResponses: 0,
            connectionStatusState_: false,
            connectionStatusMessage_: "Offline"
        }
    },
    mounted() {
        document.addEventListener('ws-opened', () => {
            console.log("received ws-opened event")
            this.handleChangedJoinSessionID(this.sessionid_)

            psh.sendData(this.sessionid_, {
                userID: this.userid_,
                data: "test message after mounting"
            })

            this.connectionStatusState_ = true
            this.connectionStatusMessage_ = "Online"
        })
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

            sendEvent ? psh.sendData(this.sessionid_, {
                event: "card-moved",
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
            sendEvent ? psh.sendData(this.sessionid_, {
                event: "deck-shuffled",
                sessionID: this.sessionid_,
                userID: this.userid_,
                cards: cobj
            }) : null
        },
        resetDeck() {
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
            this.getAllStacks()

            const cobj = {}
            Object.entries(this.cards_).forEach((kc => {
                cobj[kc[0]]=kc[1]
            }))
            psh.sendData(this.sessionid_, {
                event: "deck-initialized",
                sessionID: this.sessionid_,
                userID: this.userid_,
                cards: cobj
            })
        },
        handeCardShownChanged(card) {
            console.log('card-shown-changed', card)
            psh.sendData(this.sessionid_, {
                event: "card-shown-changed",
                sessionID: this.sessionid_,
                card: card,
                userID: this.userid_
            })
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
            if (this.sessionid_ !== joinSessionID_) {
                window.location.href=`${window.location.origin}/api/index?sessionID=`+joinSessionID_+"&code="+new URL(window.location).searchParams.get("code")
                return
            }

            this.sessionid_ = joinSessionID_;
            
            psh.joinGroup(this.sessionid_)
            
            document.addEventListener("server-deck-state", e => {
                const data = e.detail
                if (data.userID!==this.userid_) {
                    console.log("received server-deck-state event from other user")
                }
            })
            document.addEventListener("server-deck-initialized", e => {
                const data = e.detail
                if (data.userID!==this.userid_) {
                    console.log("received server-deck-initialized event from other user", data)
                    // reflect cards from socket to ui
                    for (let cardid in data.cards) {
                        this.cards_[cardid] = data.cards[cardid]
                    }
                    this.getAllStacks()
                }
            })
            document.addEventListener("server-deck-shuffled", e => {
                const data = e.detail
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
            document.addEventListener("server-card-shown-changed", e => {
                const data = e.detail
                if (data.userID!==this.userid_) {
                    console.log("received server-card-shown-changed event from other user")
                    this.cards_[data.card.id].shown = data.card.shown
                }
            })
            document.addEventListener("server-card-moved", e => {
                const data = e.detail
                if (data.userID!==this.userid_) {
                    console.log("received server-card-moved event from other user")
                    this.move_card(data.card, data.source, data.destination, sendEvent=false)
                }
            })
            document.addEventListener("server-cards-state-request", e => {
                const data = e.detail
                if (data.userID!==this.userid_) {
                    console.log("received server-cards-state-request event from other user")
                    const cobj = {}
                    Object.entries(this.cards_).forEach((kc => {
                        cobj[kc[0]]=kc[1]
                    }))
                    psh.sendData(this.sessionid_, {
                        event: "cards-state-response",
                        sessionID: this.sessionid_,
                        userID: this.userid_,
                        cards: cobj
                    })
                }
            })
            document.addEventListener("ws-closed", () => {
                this.connectionStatusState_ = false
                this.connectionStatusMessage_ = "Connection closed"
            })

            this.allowCardsGenerate = false
            this.allowCardStateReponse = true
            console.log(`setting this.allowCardStateReponse to ${this.allowCardStateReponse}`)
            this.countReceivedCardStateResponses = 0
            setTimeout(() => {
                this.allowCardStateReponse = false
                if (this.countReceivedCardStateResponses === 0) {
                    this.allowCardsGenerate = true
                }
                console.log(`setting this.allowCardStateReponse to ${this.allowCardStateReponse}`)
            }, 5000)
            psh.sendData(this.sessionid_, {
                event: "cards-state-request",
                sessionID: this.sessionid_,
                userID: this.userid_,
            })

            document.addEventListener("server-cards-state-response", e => {
                if (!this.allowCardStateReponse) {
                    console.log(`ignoring server-cards-state-response event from other user after timeout`)
                    return
                }
                const data = e.detail
                if (data.userID!==this.userid_) {
                    console.log("received server-cards-state-response event from other user")
                    // reflect cards from socket to ui
                    if (this.countReceivedCardStateResponses > 3) {
                        console.log(`ignoring server-cards-state-response event from other user after more than allowed responses`)
                        return
                    }
                    console.log(data.cards)
                    for (let cardid in data.cards) {
                        this.cards_[cardid] = data.cards[cardid]
                    }
                    this.getAllStacks()
                    this.countReceivedCardStateResponses += 1
                }
            })
        },
    },
    computed: {
        cards() {
            if (this.allowCardsGenerate) {
                if (Object.entries(this.cards_).length == 0) {
                    this.resetDeck()
                }
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