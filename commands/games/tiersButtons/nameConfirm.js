const {MessageActionRow, MessageButton, MessageEmbed} = require('discord.js');
const Discord = require('discord.js');

// This button needs to be worked on.  So far only has copy-paste from other button file
module.exports = {
	name: 'name_confirm',
  description: 'Confirm a game name.',
	execute(button, client) {
    button.reply.defer();
    require('../tiers.js').embededObj.delete();

    var yesButton = new MessageButton()
      .setStyle('green')
      .setLabel('Yes')
      .setID('name_confirm')
    var noButton = new MessageButton()
      .setStyle('red')
      .setLabel('No')
      .setID('name_incorrect')
    var embed = new Discord.MessageEmbed()
      .setTitle('Player Tier Lists - New Game')
      .setColor('BLUE')
      .setFooter('You decide who\'s the best!')
      .setDescription('\`Please enter the name of the new game.\`')
      var row = new MessageActionRow()
      .addComponents(yesButton, noButton)

    button.channel.send(embed)
      .then(message => module.exports.embededObj = message);
    button.channel.awaitMessages(m => m.author.id !== client.user.id, {max: 1, time: 10000, errors: ['time']})
      .then(collected => {
        embed.setDescription('\`Is \"' + collected.first().content + '\" correct?\`');
        collected.first().delete();
        module.exports.embededObj.delete();
        button.channel.send(embed, row);
      })
	},
};