import dotenv from "dotenv";
import { readdirSync } from "fs";
import { Client, GatewayIntentBits, Collection, REST } from "discord.js";
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildBans,
    GatewayIntentBits.GuildEmojisAndStickers,
    GatewayIntentBits.GuildIntegrations,
    GatewayIntentBits.GuildWebhooks,
    GatewayIntentBits.GuildInvites,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildMessageTyping,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.DirectMessageReactions,
    GatewayIntentBits.DirectMessageTyping,
  ],
  presence: {
    status: 'online',
    activities: [
      {
        name: "you",
        type: "WATCHING",
      },
    ],
  },
});
dotenv.config();
const token = process.env.TOKEN;
import { CronJob } from "cron";

import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

/*
 * Creates property on the client object that contain access to the various command files
 */
client.commands = new Collection();
const foldersPath = join(__dirname, 'commands')
  // "E:\\Users\\joshd\\Documents\\GitHub\\TheApe-Discord-Bot\\commands";
const commandFolders = readdirSync(foldersPath);

for (const folder of commandFolders) {
  const commandsPath = join(foldersPath, folder);
  const commandFiles = readdirSync(commandsPath).filter((file) =>
    file.endsWith(".js")
  );
  for (const file of commandFiles) {
    const filePath = join(commandsPath, file);
    const command = await import(`file://${filePath}`);
    // Set a new item in the Collection with the key as the command name and the value as the exported module
    if ("data" in command && "execute" in command) {
      client.commands.set(command.data.name, command);
    } else {
      console.log(
        `[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`
      );
    }
  }
}

/*
 * Event handlers
 */
client.on("ready", () => console.log(`Logged in as ${client.user.tag}.`));

// client.on("messageCreate", async (message) => {
//   console.log(message);
//   if (message.author.id === client.user.id) {
//     client.user.lastMessageID = message.id;
//   }
//   if (message.content.startsWith(config.prefix)) {
//     let args = message.content.slice(config.prefix.length).split(" ");
//     let command = args.shift().toLowerCase();

//     if (!client.commands.has(command)) return;

//     try {
//       client.commands.get(command).execute(message, args, client);
//     } catch (error) {
//       console.error(error);
//       message.reply("There was an error trying to execute that command!");
//     }
//   }
// });

// Construct and prepare an instance of the REST module
const rest = new REST().setToken(token);

// and deploy your commands!
// (async () => {
//   try {
//     console.log(
//       `Started refreshing ${client.commands.length} application (/) commands.`
//     );

//     // The put method is used to fully refresh all commands in the guild with the current set
//     const data = await rest.put(
//       Discord.Routes.applicationCommands("813957126912213012"),
//       { body: client.commands }
//     );

//     console.log(
//       `Successfully reloaded ${data.length} application (/) commands.`
//     );
//   } catch (error) {
//     // And of course, make sure you catch and log any errors!
//     console.error(error);
//   }
// })();

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const command = interaction.client.commands.get(interaction.commandName);

  if (!command) {
    console.error(`No command matching ${interaction.commandName} was found.`);
    return;
  }

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(error);
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({
        content: "There was an error while executing this command!",
        ephemeral: true,
      });
    } else {
      await interaction.reply({
        content: "There was an error while executing this command!",
        ephemeral: true,
      });
    }
  }
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

await client.login(token);
