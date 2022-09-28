const Discord = require("discord.js");
const config = require("./config");
const fs = require("fs");
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
    Discord.Intents.FLAGS.DIRECT_MESSAGE_TYPING,
  ],
  presence: {
    status: "online",
    activities: [
      {
        name: "you",
        type: "WATCHING",
      },
    ],
  },
});
require("dotenv").config();
const token = process.env.TOKEN;
const { CronJob } = require("cron");

/*
 * Creates property on the client object that contain access to the various command files
 */
const commandFolders = fs.readdirSync("./commands");

client.commands = new Discord.Collection();
for (let folder of commandFolders) {
  let commandFiles = fs
    .readdirSync(`./commands/${folder}`)
    .filter((file) => file.endsWith(".js"));
  for (let file of commandFiles) {
    const command = require(`./commands/${folder}/${file}`);
    client.commands.set(command.name, command);
  }
}

/*
 * Event handlers
 */
client.on("ready", () => console.log(`Logged in as ${client.user.tag}.`));

client.on("messageCreate", async (message) => {
  if (message.author.id === client.user.id) {
    client.user.lastMessageID = message.id;
  }
  if (message.content.startsWith(config.prefix)) {
    let args = message.content.slice(config.prefix.length).split(" ");
    let command = args.shift().toLowerCase();

    if (!client.commands.has(command)) return;

    try {
      client.commands.get(command).execute(message, args, client);
    } catch (error) {
      console.error(error);
      message.reply("There was an error trying to execute that command!");
    }
  }
});

client.on("interactionCreate", (interaction) => {
  if (!interaction.isChatInputCommand()) return;
});

// let { getNews } = require("./commands/resources/news.js");
// let postNews = new CronJob(
//   "00 00 12 * * 1-5", // Post Monday thru Friday, at 12pm
//   () => getNews(client),
//   null,
//   false,
//   "America/New_York"
// );
// postNews.start();

client.login(token);
