/**
 * Copyright JS Foundation and other contributors, http://js.foundation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 **/

module.exports = function (RED) {
  "use strict";
  var hashSum = require("hash-sum");

  function BotWebCard(config) {
    RED.nodes.createNode(this, config);
    var node = this;
    this.url = config.url;
    this.urlType = config.urlType;
    this.header = config.header;
    this.headerType = config.headerType;

    async function getValue(value, valueType, msg) {
      return new Promise(function (resolve, reject) {
        if (valueType === "str") {
          resolve(value);
        } else {
          RED.util.evaluateNodeProperty(
            value,
            valueType,
            this,
            msg,
            function (err, res) {
              console.log(err, res);
              if (err) {
                node.error(err.msg);
                reject(err.msg);
              } else {
                resolve(res);
              }
            }
          );
        }
      });
    }

    this.on("input", async function (msg) {
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
        let url = await getValue(this.url, this.urlType, msg);
        let header = await getValue(this.header, this.headerType, msg);

        let payload = {
          _taskid: msg._taskid,
          type: "card",
          payload: {
            mode: "web",
            display: "expanded",
            moduleWidth: 40,
            top: {
              icon: "chevron-right",
              text: header,
            },
            middle: {
              url: url,
            },
            bottom: {
              visible: false,
              actionItems: [],
            },
          },
        };

        msg.res._res.status(statusCode).jsonp(payload);
      } else {
        node.warn(RED._("httpin.errors.no-response"));
      }
    });
  }
  RED.nodes.registerType("bot-web-card", BotWebCard);
};
