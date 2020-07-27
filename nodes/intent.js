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

    console.log(
      "intent loaded",
      {
        node: node,
        tab: tab,
        group: group,
        forwardInputMessages: false,
        control: {
          type: "form",
          label: config.label,
          order: config.order,
          value: config.payload || node.id,
          options: config.options,
          formValue: config.formValue,
        },
      },
      config.options
    );
  }
  RED.nodes.registerType("bot-intent", IntentNode);
};
