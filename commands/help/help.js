const Discord = require('discord.js');
const { prefix } = require('../../config.js');

module.exports = {
  name: 'help',
  description: 'Lists all of my commands or info about a specific command.',
  execute(message, args, client) {
    const { commands } = client;
    const embed = new Discord.MessageEmbed()
      .setTitle('HELP MENU')
      .setColor('SUCCESS')
      .setFooter(`Requested by: ${message.member ? message.member.displayName : message.author.username}`, message.author.displayAvatarURL())
      .setThumbnail(message.client.user.displayAvatarURL());

    if (!args.length) {
      embed.setDescription(Array.from(commands.keys()).map(command => `\`${command.padEnd(Array.from(commands.keys).reduce((a, b) => b.length > a.length ? b : a, '').length)}\` :: ${commands.get(command).description}`).join('\n'));
    }

    message.channel.send({content: null, embeds: [embed], components: []});
  }
}