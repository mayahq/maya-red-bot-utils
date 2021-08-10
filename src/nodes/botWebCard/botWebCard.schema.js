const {
    Node,
    Schema,
    fields
} = require('@mayahq/module-sdk');
var hashSum = require("hash-sum");

class BotWebCard extends Node {
    constructor(node, RED, opts) {
        super(node, RED, {
            ...opts,
            // masterKey: 'You can set this property to make the node fall back to this key if Maya does not provide one'
        })
    }

    static schema = new Schema({
        name: 'bot-web-card',
        label: 'bot-web-card',
        category: 'Maya Red Bot Utils',
        isConfig: false,
        fields: {
            url: new fields.Typed({ type: 'str', defaultVal: '', allowedTypes: ['msg', 'flow', 'global'] }),
            header: new fields.Typed({type: 'str', defaultVal: '', allowedTypes: ['msg', 'flow', 'global']})
        },

    })

    onInit() {
        // Do something on initialization of node
    }

    async onMessage(msg, vals) {
        if (msg.res) {
            var headers = {};
            if (msg.headers) {
                if (msg.headers.hasOwnProperty("x-node-red-request-node")) {
                    var headerHash = msg.headers["x-node-red-request-node"];
                    delete msg.headers["x-node-red-request-node"];
                    var hash = hashSum(msg.headers);
                    if (hash === headerHash) {
                        delete msg.headers;
                    }
                }
                if (msg.headers) {
                    for (var h in msg.headers) {
                        if (msg.headers.hasOwnProperty(h) && !headers.hasOwnProperty(h)) {
                            headers[h] = msg.headers[h];
                        }
                    }
                }
            }
            if (Object.keys(headers).length > 0) {
                msg.res._res.set(headers);
            }
            if (msg.cookies) {
                for (var name in msg.cookies) {
                    if (msg.cookies.hasOwnProperty(name)) {
                        if (
                            msg.cookies[name] === null ||
                            msg.cookies[name].value === null
                        ) {
                            if (msg.cookies[name] !== null) {
                                msg.res._res.clearCookie(name, msg.cookies[name]);
                            } else {
                                msg.res._res.clearCookie(name);
                            }
                        } else if (typeof msg.cookies[name] === "object") {
                            msg.res._res.cookie(
                            name,
                            msg.cookies[name].value,
                            msg.cookies[name]
                            );
                        } else {
                            msg.res._res.cookie(name, msg.cookies[name]);
                        }
                    }
                }
            }
            var statusCode = 200;

            let payload = {
                _taskid: msg._taskid,
                type: "card",
                payload: {
                    mode: "web",
                    display: "expanded",
                    moduleWidth: 40,
                    top: {
                        icon: "chevron-right",
                        text: vals.header,
                    },
                    middle: {
                        url: vals.url,
                    },
                    bottom: {
                        visible: false,
                        actionItems: [],
                    },
                },
            };
            msg.res._res.status(statusCode).jsonp(payload);
        } else {
            this._node.warn(this.RED._("httpin.errors.no-response"));
        }

    }
}

module.exports = BotWebCard