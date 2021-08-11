const {
    Node,
    Schema,
    fields
} = require('@mayahq/module-sdk');
var hashSum = require("hash-sum");
class BotDashCard extends Node {
    constructor(node, RED, opts) {
        super(node, RED, {
            ...opts,
            // masterKey: 'You can set this property to make the node fall back to this key if Maya does not provide one'
        })
    }

    static schema = new Schema({
        name: 'bot-dash-card',
        label: 'bot-dash-card',
        category: 'Maya Red Bot Utils',
        isConfig: false,
        fields: {
            header: 
        },

    })

    onInit() {
        // Do something on initialization of node
    }

    async onMessage(msg, vals) {
        // Handle the message. The returned value will
        // be sent as the message to any further nodes.

    }
}

module.exports = BotDashCard