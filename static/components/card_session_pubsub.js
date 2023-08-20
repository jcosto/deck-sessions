app.component('card-session', {
    props: {
        sessionid: {},
        connectionstatusstate: {},
        connectionstatusmessage: {}
    },
    template:
    `
    <nav class="navbar navbar-expand-lg navbar-light bg-primary">
        <div class="container-fluid">
            <a class="navbar-brand h1 text-light" href="#">
                <i class="fa-solid fa-copy"></i>
                <i class="fa-solid fa-users"></i>
            </a>

            <div>
                <span class="text-light">
                    <button @click="showSessionIDInput" v-if="!showJoinSessionID">{{sessionid}}</button>
                    <input type="text" v-model="newSessionID" v-if="showJoinSessionID" @change="handleChangedJoinSessionID" @blur="hideSessionIDInput">
                </span>
                <a
                    :class="connectionstatusstate ? 'text-success' : 'text-warning'"
                    type="button"
                    data-bs-trigger="focus" 
                    data-bs-toggle="popover" data-bs-placement="bottom" 
                    data-bs-content="{{connectionstatusmessage}}">
                        <i class="fa-solid fa-circle-dot"></i>
                    </a>
            </div>
            <div>
                <button class="btn text-light">
                    <i class="fa-solid fa-user-plus"></i>
                </button>
                <button class="btn text-light">
                    <i class="fa-solid fa-sign-in-alt"></i>
                </button>
            </div>
        </div>
    </nav>
    `,
    data() {
        return {
            showJoinSessionID: false,
            newSessionID: null,
        }
    },
    methods: {
        showSessionIDInput() {
            this.newSessionID = this.sessionid
            this.showJoinSessionID = true
            console.log("showSessionIDInput", this.showJoinSessionID)
        },
        hideSessionIDInput() {
            this.showJoinSessionID = false
            console.log("hideSessionIDInput", this.showJoinSessionID)
        },
        handleChangedJoinSessionID() {
            console.log("changed-session-id", this.newSessionID)
            this.$emit("changed-session-id", this.newSessionID)
            this.showJoinSessionID = false
        },
    }
})
