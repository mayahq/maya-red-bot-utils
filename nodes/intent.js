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

  function IntentNode(config) {
    RED.nodes.createNode(this, config);
    var node = this;

    console.log("Testing..");
    if (RED.settings.httpNodeRoot !== false) {
      this.errorHandler = function (err, req, res, next) {
        node.warn(err);
        res.sendStatus(500);
      };

      this.callback = function (req, res) {
        var msgid = RED.util.generateId();
        res._msgid = msgid;
        node.send({
          _msgid: msgid,
          req: req,
          res: "hello",
          payload: req.body,
        });

        res.send({ test: "test", body: req.body });
        console.log(res.body);
        // node.send({
        //   _msgid: msgid,
        //   req: req,
        //   res: createResponseWrapper(node, res),
        //   payload: req.body,
        // });
      };
      var maxApiRequestSize = RED.settings.apiMaxLength || "5mb";
      var jsonParser = bodyParser.json({ limit: maxApiRequestSize });
      var urlencParser = bodyParser.urlencoded({
        limit: maxApiRequestSize,
        extended: true,
      });

      console.log(config.options, config);

      RED.httpNode.post(
        config.endpointUrl,
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
            route.route.path === node.url &&
            route.route.methods[node.method]
          ) {
            routes.splice(i, 1);
          }
        });
      });
    } else {
      this.warn(RED._("httpin.errors.not-created"));
    }
  }
  RED.nodes.registerType("bot-intent", IntentNode);
};
