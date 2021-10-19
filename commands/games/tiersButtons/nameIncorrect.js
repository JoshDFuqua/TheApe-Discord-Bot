const {MessageActionRow, MessageButton, MessageEmbed} = require('discord.js');
const tiers = require('../tiers.js');

module.exports = {
	name: 'name_incorrect',
  description: 'Verify the previously entered game name is incorrect.',
	execute(button, client) {
    button.deferUpdate();
    var yesButton = new MessageButton()
      .setStyle('SUCCESS')
      .setLabel('Yes')
      .setCustomId('name_confirm');
    var noButton = new MessageButton()
      .setStyle('DANGER')
      .setLabel('No')
      .setCustomId('name_incorrect');
    var embed = new MessageEmbed()
      .setTitle('Player Tier Lists - New Game')
      .setColor('BLUE')
      .setFooter('You decide who\'s the best!')
      .setDescription('\`Please re-enter the name of the new game.\`')
    var row = new MessageActionRow()
      .addComponents(yesButton, noButton);

    tiers.embededObj.edit({content: null, embeds: [embed], components: []});
    let filter = m => m.author.id === tiers.msgAuthor;
    tiers.embededObj.channel.awaitMessages({filter, max: 1, time: 10000, errors: ['time']})
      .then(collected => {
        embed.setDescription('\`Is \"' + collected.first().content + '\" correct?\`');
        tiers.embededObj.edit({content: null, embeds: [embed], components: [row]});
        collected.first().delete();
      })
      .catch(err => console.log(err));
	},
};