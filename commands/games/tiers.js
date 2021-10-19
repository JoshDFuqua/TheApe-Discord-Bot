const {MessageActionRow, MessageButton, MessageEmbed} = require('discord.js');

module.exports = {
	name: 'tiers',
  description: 'Create/view tier lists of your friends for games you play.',
  embededObj: undefined,
  msgAuthor: undefined,
	execute(message, args, client) {
		var newGameButton = new MessageButton()
      .setCustomId('new_game')
      .setLabel('New Game')
      .setStyle('SUCCESS');
    var viewGamesButton = new MessageButton()
      .setStyle('PRIMARY')
      .setLabel('View Games')
      .setCustomId('view_games');
    var embed = new MessageEmbed()
      .setTitle('Player Tier Lists')
      .setColor('BLUE')
      .setFooter('You decide who\'s the best!')
      .setDescription('\`Edit a game\'s ratings list or add a new one.\`');
    var row = new MessageActionRow()
      .addComponents(newGameButton, viewGamesButton);

    module.exports.msgAuthor = message.author.id;
    message.delete();
    message.channel.send({content: null, components: [row], embeds: [embed]})
      .then(message => module.exports.embededObj = message)
	},
};


git config core.excludesfile ~/.env