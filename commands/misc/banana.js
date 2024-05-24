import { SlashCommandBuilder } from 'discord.js';

export const data = new SlashCommandBuilder()
	.setName('banana')
	.setDescription('banana');
export async function execute(interaction) {
	interaction.reply({ content: 'where banana', tts: true });
}