import { EmbedBuilder } from 'discord.js';

export const name = 'help';
export const description = 'Lists all of my commands or info about a specific command.';
export function execute(message, args, client) {
	const { commands } = client;
	const embed = new EmbedBuilder()
		.setTitle('HELP MENU')
		.setColor('GREEN')
		.setFooter(
			{
				text: `Requested by: ${message.member ? message.member.displayName : message.author.username}`,
			},
			message.author.displayAvatarURL())
		.setThumbnail(client.user.displayAvatarURL());

	if (!args.length) {
		embed.setDescription(
			Array.from(commands.keys())
				.map((command) => {
					if (command) {
						return `\`${command.padEnd(
							Array.from(commands.keys).reduce(
								(a, b) => (b.length > a.length ? b : a),
								'').length)}\` :: ${commands.get(command).description}`;
					}
				})
				.join('\n'));
	}

	message.channel.send({ content: null, embeds: [embed], components: [] });
}