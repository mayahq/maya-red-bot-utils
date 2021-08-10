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

  var bodyParser = require("body-parser");
  var cors = require("cors");

  if (RED.settings.httpNodeCors) {
    corsHandler = cors(RED.settings.httpNodeCors);
    RED.httpNode.options("*", corsHandler);
  }

  function BotCommand(config) {
    RED.nodes.createNode(this, config);
    var node = this;

    if (RED.settings.httpNodeRoot !== false) {
      this.errorHandler = function (err, req, res, next) {
        node.warn(err);
        res.sendStatus(500);
      };

      this.callback = function (req, res) {
        var msgid = RED.util.generateId();
        res._msgid = msgid;
        node.send(
          {
            _msgid: msgid,
            req: req,
            res: createResponseWrapper(node, res),
            payload: req.body,
            _taskid: req.body.taskId,
          },
          false
        );
      };
      var maxApiRequestSize = RED.settings.apiMaxLength || "5mb";
      var jsonParser = bodyParser.json({ limit: maxApiRequestSize });
      var urlencParser = bodyParser.urlencoded({
        limit: maxApiRequestSize,
        extended: true,
      });

      RED.httpNode.post(
        config.endpointUrl,
        corsHandler,
        jsonParser,
        urlencParser,
        rawBodyParser,
        this.callback,
        this.errorHandler
      );

      this.on("close", function () {
        var node = this;
        RED.httpNode._router.stack.forEach(function (route, i, routes) {
          if (
            route.route &&
            route.route.path === config.endpointUrl &&
            route.route.methods["post"]
          ) {
            routes.splice(i, 1);
          }
        });
      });
    } else {
      this.warn(RED._("httpin.errors.not-created"));
    }
  }
  RED.nodes.registerType("bot-command", BotCommand);
};
