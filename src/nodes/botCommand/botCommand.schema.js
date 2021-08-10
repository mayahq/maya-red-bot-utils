const {
    Node,
    Schema
} = require('@mayahq/module-sdk');
var bodyParser = require("body-parser");
var cors = require("cors");
const {rawBodyParser, createResponseWrapper, corsHandler} = require("../../utils")
class BotCommand extends Node {
    constructor(node, RED, opts) {
        super(node, RED, {
            ...opts,
            // masterKey: 'You can set this property to make the node fall back to this key if Maya does not provide one'
        })
    }

    static schema = new Schema({
        name: 'bot-command',
        label: 'bot-command',
        category: 'Maya Red Bot Utils',
        isConfig: false,
        fields: {
            // Whatever custom fields the node needs.
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

module.exports = BotCommand