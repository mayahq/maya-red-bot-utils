module.exports = function (RED) {
  function IntentNode(config) {
    RED.nodes.createNode(this, config);
    var node = this;

    console.log("Testing..");

    console.log(config.options);
  }
  RED.nodes.registerType("bot-intent", IntentNode);
};
