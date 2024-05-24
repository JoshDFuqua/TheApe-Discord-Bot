import { SlashCommandBuilder } from 'discord.js';

export const data = new SlashCommandBuilder()
	.setName('fibonacci')
	.setDescription('Gives the value of the fibonacci sequence at the given location.')
	.addNumberOption(option =>
		option.setName('position')
			.setDescription('position in the fibonacci sequence')
			.setRequired(true),
	);
export async function execute(interaction) {
	const n = interaction.options.getNumber('position');
	if (n === 0 || n === 1) {
		return n;
	}

	let fib1 = 0;
	let fib2 = 1;
	for (let i = 2; i <= n; i++) {
		fib2 = fib2 + fib1;
		fib1 = fib2 - fib1;
	}

	await interaction.reply('The ' + n + 'th position in the fibonacci sequence is ' + fib2);
	if (n > 79) await interaction.followUp('Note: For positions 80 and above, the number will be rounded, and/or converted to scientific notation.');
}