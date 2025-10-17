import { SlashCommandBuilder } from 'discord.js';

export const data = new SlashCommandBuilder()
	.setName('ping')
	.setDescription('Checks connectivity with discord\'s servers.');
export async function execute(interaction) {
	await interaction.reply('Pinging...');
	await interaction.editReply(
		`PONG! Message round-trip took ${
			Date.now() - interaction.createdTimestamp
		}ms.`,
	);
}
