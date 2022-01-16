const Discord = require('discord.js')
const config = require('./config');
const fs = require('fs');
const client = new Discord.Client({
  intents: [
    Discord.Intents.FLAGS.GUILDS,
    Discord.Intents.FLAGS.GUILD_BANS,
    Discord.Intents.FLAGS.GUILD_EMOJIS_AND_STICKERS,
    Discord.Intents.FLAGS.GUILD_INTEGRATIONS,
    Discord.Intents.FLAGS.GUILD_WEBHOOKS,
    Discord.Intents.FLAGS.GUILD_INVITES,
    Discord.Intents.FLAGS.GUILD_VOICE_STATES,
    Discord.Intents.FLAGS.GUILD_MESSAGES,
    Discord.Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
    Discord.Intents.FLAGS.GUILD_MESSAGE_TYPING,
    Discord.Intents.FLAGS.DIRECT_MESSAGES,
    Discord.Intents.FLAGS.DIRECT_MESSAGE_REACTIONS,
    Discord.Intents.FLAGS.DIRECT_MESSAGE_TYPING
  ],
  presence: {
    status: 'online',
    activities: [{
      name: 'you',
      type: 'WATCHING'
    }]
  }
});
require('dotenv').config();
const token = process.env.TOKEN;

/*
 * Creates properties on the client object that contain access to the various command and button files
 */
const commandFolders = fs.readdirSync('./commands');

client.commands = new Discord.Collection();
for (let folder of commandFolders) {
	let commandFiles = fs.readdirSync(`./commands/${folder}`).filter(file => file.endsWith('.js'));
  for (let file of commandFiles) {
		const command = require(`./commands/${folder}/${file}`);
		client.commands.set(command.name, command);
	}
}
client.buttons = new Discord.Collection();
for (let folder of commandFolders) {
	let commandFiles = fs.readdirSync(`./commands/${folder}`).filter(file => !file.endsWith('.js'));
  for (let buttonFolder of commandFiles) {
		let buttonFiles = fs.readdirSync(`./commands/${folder}/${buttonFolder}`).filter(file => file.endsWith('.js'));
    for (let file of buttonFiles) {
      const button = require(`./commands/${folder}/${buttonFolder}/${file}`);
      client.buttons.set(button.name, button);
    }
	}
}

/*
 * Event handlers
 */
client.on('ready', () => console.log(`Logged in as ${client.user.tag}.`));

client.on('messageCreate', async message => {
  if (message.author.id === client.user.id) {
    client.user.lastMessageID = message.id;
  }
  if (message.content.startsWith(config.prefix)) {
    let args = message.content.slice(config.prefix.length).split(' ');
    let command = args.shift().toLowerCase();

    if (!client.commands.has(command)) return;

    try {
      client.commands.get(command).execute(message, args, client);
    } catch (error) {
      console.error(error);
      message.reply('there was an error trying to execute that command!');
    }
  }
});

client.on('interactionCreate', async button => {
  let buttonID = button.customId
  if (!client.buttons.has(buttonID)) return;
  try {
    client.buttons.get(buttonID).execute(button, client)
  } catch (error) {
    console.log(error)
  }
});

client.login(token);