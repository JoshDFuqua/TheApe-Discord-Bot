const {MessageActionRow, MessageSelectMenu, MessageButton, MessageEmbed} = require('discord.js');
const tiers = require('../tiers.js');
require('dotenv').config({path: '../../.env'});
// const mysql = require('mysql');
// const connection = mysql.createConnection({
//   host : process.env.DBHOST,
//   user : process.env.DBUSER,
//   password : process.env.DBPASS,
//   database : process.env.DBNAME,
//   port: 3306
// });

module.exports = {
	name: 'view_games',
  description: 'View the current list of games and their respective player ratings.',
  currentGames: [],
	execute(button, client) {
    button.deferUpdate();
    connection.connect((err) => {
      if (err) throw err;
      connection.query("SELECT * FROM Ratings WHERE Guild_ID=?", [button.guildId], (err, results) => {
        if (err) throw err;
        if (results.length === 0) {
          let backButton = new MessageButton()
            .setStyle('BLUE')
            .setLabel('Back')
            .setCustomId('back_button');
          let exitButton = new MessageButton()
            .setStyle('DANGER')
            .setLabel('Exit')
            .setCustomId('exit_button');
          let embed = new MessageEmbed()
            .setTitle('Player Tier Lists - Games List')
            .setColor('BLUE')
            .setFooter('You decide who\'s the best!')
            .setDescription('\`There are currently no ratings for your server.\nGo back and add a game and some ratings first!\`');
          var row = new MessageActionRow()
            .addComponents(backButton, exitButton);

          tiers.embededObj.edit({content: null, embeds: [embed], components: [row]});
          connection.end();
        } else {
          let tempGamesList = {}
          let menuList = [];

          for (let i = 0; i < results.length; i++) {
            if (!(results[i].Game_Title in tempGamesList)) {
              tempGamesList[results[i].Game_Title] = results[i].Game_Title;
              menuList.push({
                label: results[i].Game_Title,
                value: results[i].Game_Title
              })
            }
          }

          let menu = new MessageSelectMenu()
            .setCustomId('games_list')
            .setPlaceholder('Select a game')
            .addOptions(menuList);
          let backButton = new MessageButton()
            .setStyle('BLUE')
            .setLabel('Back')
            .setCustomId('back_button');
          let exitButton = new MessageButton()
            .setStyle('DANGER')
            .setLabel('Exit')
            .setCustomId('exit_button');
          let embed = new MessageEmbed()
            .setTitle('Player Tier Lists - Games List')
            .setColor('BLUE')
            .setFooter('You decide who\'s the best!')
            .setDescription('\`Choose from the list below!\`');
          let row1 = new MessageActionRow()
            .addComponents(menu);
          let row2 = new MessageActionRow()
            // .addComponents();

          tiers.embededObj.edit({content: null, embeds: [embed], components: [row1, row2]});
          connection.end();
        }
      })
    })
  }
};

