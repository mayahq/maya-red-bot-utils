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
  var multer = require("multer");
  var cookieParser = require("cookie-parser");
  var getBody = require("raw-body");
  var cors = require("cors");
  var onHeaders = require("on-headers");
  var typer = require("content-type");
  var mediaTyper = require("media-typer");
  var isUtf8 = require("is-utf8");
  var hashSum = require("hash-sum");

  function rawBodyParser(req, res, next) {
    if (req.skipRawBodyParser) {
      next();
    } // don't parse this if told to skip
    if (req._body) {
      return next();
    }
    req.body = "";
    req._body = true;

    var isText = true;
    var checkUTF = false;

    if (req.headers["content-type"]) {
      var contentType = typer.parse(req.headers["content-type"]);
      if (contentType.type) {
        var parsedType = mediaTyper.parse(contentType.type);
        if (parsedType.type === "text") {
          isText = true;
        } else if (
          parsedType.subtype === "xml" ||
          parsedType.suffix === "xml"
        ) {
          isText = true;
        } else if (parsedType.type !== "application") {
          isText = false;
        } else if (
          parsedType.subtype !== "octet-stream" &&
          parsedType.subtype !== "cbor"
        ) {
          checkUTF = true;
        } else {
          // application/octet-stream or application/cbor
          isText = false;
        }
      }
    }

    getBody(
      req,
      {
        length: req.headers["content-length"],
        encoding: isText ? "utf8" : null,
      },
      function (err, buf) {
        if (err) {
          return next(err);
        }
        if (!isText && checkUTF && isUtf8(buf)) {
          buf = buf.toString();
        }
        req.body = buf;
        next();
      }
    );
  }

  function createResponseWrapper(node, res) {
    var wrapper = {
      _res: res,
    };
    var toWrap = [
      "append",
      "attachment",
      "cookie",
      "clearCookie",
      "download",
      "end",
      "format",
      "get",
      "json",
      "jsonp",
      "links",
      "location",
      "redirect",
      "render",
      "send",
      "sendfile",
      "sendFile",
      "sendStatus",
      "set",
      "status",
      "type",
      "vary",
    ];
    toWrap.forEach(function (f) {
      wrapper[f] = function () {
        node.warn(
          RED._("httpin.errors.deprecated-call", { method: "msg.res." + f })
        );
        var result = res[f].apply(res, arguments);
        if (result === res) {
          return wrapper;
        } else {
          return result;
        }
      };
    });
    return wrapper;
  }

  var corsHandler = function (req, res, next) {
    next();
  };

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
