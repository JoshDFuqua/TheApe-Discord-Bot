module.exports = {
  name: "say",
  description: "Make the bot say something",
  execute(message, args) {
    let response = [...args].join(" ");
    message.delete();
    message.channel.send({ content: `${response}` });
  },
};
