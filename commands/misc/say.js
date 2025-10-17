export const name = 'say';
export const description = 'Make the bot say something';
export function execute(message, args) {
	const response = [...args].join(' ');
	message.delete();
	message.channel.send({ content: `${response}` });
}
