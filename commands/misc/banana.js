module.exports = {
  name: 'banana',
  description: 'banana',
  execute(message, args, client) {
    if (message.author.id === client.user.id) return;

    message.react('🍌');
    message.channel.send({content: 'where banana', tts: true})
  },
};