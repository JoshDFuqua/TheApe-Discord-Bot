module.exports = {
	name: 'ping',
  description: 'Checks connectivity with discord\'s servers.',
	async execute(message, args) {
		let msg = await message.reply('Pinging...');
    await msg.edit(`PONG! Message round-trip took ${Date.now() - msg.createdTimestamp}ms.`)
	},
};