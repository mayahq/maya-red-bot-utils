module.exports = function (RED) {
  function IntentNode(config) {
    RED.nodes.createNode(this, config);
    var node = this;

    var group = RED.nodes.getNode(config.group);
    if (!group) {
      return;
    }
    var tab = RED.nodes.getNode(group.config.tab);
    if (!tab) {
      return;
    }

    console.log("intent loaded");
  }
  RED.nodes.registerType("bot-intent", IntentNode);
};
