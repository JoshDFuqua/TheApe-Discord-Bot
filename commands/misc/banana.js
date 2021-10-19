module.exports = {
  name: 'banana',
  description: 'banana',
  execute(message, args) {
    message.react('🍌');
    message.channel.send({content: 'where banana', tts: true})
  },
};