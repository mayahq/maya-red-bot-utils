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

const rawBodyParser = (req, res, next) => {
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

const createResponseWrapper = (node, res) => {
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

const corsHandler = function (req, res, next) {
    next();
};

module.exports = {
    rawBodyParser,
    createResponseWrapper,
    corsHandler
}