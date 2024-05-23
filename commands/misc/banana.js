import { SlashCommandBuilder } from 'discord.js';

export const data = new SlashCommandBuilder().setName('banana').setDescription('banana');
export function execute(message, args, client) {
	if (message.author.id === client.user.id) return;

	message.react('🍌');
	message.channel.send({ content: 'where banana', tts: true });
}