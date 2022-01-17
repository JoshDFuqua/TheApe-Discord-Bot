const { MessageEmbed } = require('discord.js');
const axios = require('axios');
require('dotenv').config();

axios.defaults.headers.common['X-Riot-Token'] = process.env.LoL_TOKEN;

module.exports = {
	name: 'lolstats',
  description: 'View general stats from your previous 15 LoL matches',
	execute(message, args, client) {
    message.channel.sendTyping()
    let summonerName = args.join(' ');

    // Request PUUID from API based on inputted summoner name
    axios({
      method: 'GET',
      url: `https://na1.api.riotgames.com/lol/summoner/v4/summoners/by-name/${summonerName}`
    })
    .then(response => {
      let puuid = response.data.puuid;
      let summonerIcon = response.data.profileIconId;

      // Request 15 most recent matches based on received PUUID
      axios({
        method: 'GET',
        url: `https://americas.api.riotgames.com/lol/match/v5/matches/by-puuid/${puuid}/ids?start=0&count=15`
      })
      .then(response => {
        let kills = 0,
          deaths = 0,
          assists = 0,
          totalGold = 0,
          dblKills = 0,
          tplKills = 0,
          qdaKills = 0,
          ptaKills = 0;
        let champs = {};

        let promiseArr = [];
        let matchPromise = matchID => {
            return new Promise((resolve, reject) => {
              // Request match data based on passed in matchID
              axios({
                method: 'GET',
                url: `https://americas.api.riotgames.com/lol/match/v5/matches/${matchID}`
              })
              .then(match => {
                let players = match.data.info.participants;

                players.forEach(player => {
                  if (player.puuid === puuid) {
                    kills += player.kills;
                    deaths += player.deaths;
                    assists += player.assists;
                    totalGold += player.goldEarned;
                    dblKills += player.doubleKills;
                    tplKills += player.tripleKills;
                    qdaKills += player.quadraKills;
                    ptaKills += player.pentaKills;

                    if (champs[player.championName] === undefined) {
                      champs[player.championName] = {
                        count: 1,
                        timestamp: match.data.info.gameEndTimestamp
                      }
                    } else {
                      champs[player.championName].count += 1;
                      champs[player.championName].timestamp = (match.data.info.gameEndTimestamp > champs[player.championName].timestamp) ?
                        match.data.info.gameEndTimestamp :
                        champs[player.championName].timestamp;
                    }
                  }
                })
              })
              .then(() => {
                resolve()
              })
              .catch(err => {
                reject(err)
              });
            });
        };

        response.data.forEach(matchID => {
          promiseArr.push(matchPromise(matchID))
        });

        Promise.all(promiseArr)
          .then(() => {
            // Code block covering bot's response to the user
            let favChamp = {
              name: undefined,
              count: 0,
              timestamp: 0
            };
            for (let champ in champs) {
              if (champs[champ].count > favChamp.count) {
                favChamp.name = champ;
                favChamp.count = champs[champ].count;
                favChamp.timestamp = champs[champ].timestamp;
              } else if (champs[champ].count === favChamp.count && champs[champ].timestamp > favChamp.timestamp) {
                favChamp.name = champ;
                favChamp.count = champs[champ].count;
                favChamp.timestamp = champs[champ].timestamp;
              }
            }

            let reply = new MessageEmbed()
              .setAuthor({name: summonerName, iconURL: `http://ddragon.leagueoflegends.com/cdn/12.1.1/img/profileicon/${summonerIcon}.png`})
              .setColor('#008A00')
              .setDescription('Stats from the 15 most recent games')
              .setThumbnail(`http://ddragon.leagueoflegends.com/cdn/12.1.1/img/champion/${favChamp.name}.png`) // This link may change
              .addFields(
                {name: '\u200B', value: '-- KDA ----------------------------------------'},
                {name: 'Kills', value: `${kills}`, inline: true},
                {name: 'Deaths', value: `${deaths}`, inline: true},
                {name: 'Assists', value: `${assists}`, inline: true},
                {name: '\u200B', value: '\u200B'},
                {name: 'KD Ratio', value: `${(kills / deaths).toFixed(2)}`},
                {name: '\u200B', value: '-- Multi-Kills --------------------------------'},
                {name: 'Doubles', value: `${dblKills}`, inline: true},
                {name: 'Triples', value: `${tplKills}`, inline: true},
                {name: '\u200B', value: '\u200B'},
                {name: 'Quadras', value: `${qdaKills}`, inline: true},
                {name: 'Pentas', value: `${ptaKills}`, inline: true},
                {name: '\u200B', value: '-- Misc ---------------------------------------'},
                {name: 'Total Gold', value: `${totalGold}`},
              )
              .setFooter({text: 'Data obtained via Riot API; aggregated by The Ape', iconURL: client.user.displayAvatarURL()})

            message.channel.send({content: null, embeds: [reply]})
          })
      })
    })
    .catch(err => {
      console.log(err);
      switch (err.response.statusText) {
        case 'Not Found':
          message.channel.send({content: 'That character doesn\'t exist!'})
          break;
      }
    })
	}
};