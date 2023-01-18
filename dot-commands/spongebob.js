const fn = require('../functions.js');
const config = require('../config.json');

module.exports = {
	name: 'spongebob',
	alias: 'sb',
	description: 'SpOnGeBoB-iFy AnYtHiNg AuToMaTiCaLly',
	usage: '<text to convert>.spongebob',
	execute(message, commandData) {
		// message.reply(fn.spongebob(commandData)).then(() => {
		// 	message.delete();
		// });
		if (message.reference != undefined) {
			const repliedMessageId = message.reference.messageId;
			message.channel.messages.fetch(repliedMessageId)
				.then(repliedMessage => {
					repliedMessage.reply(fn.spongebob({ args: repliedMessage.content })).then(() => {
						message.delete();
					});
				})
				.catch(err => {
					console.error(err);
				});
		} else {
			message.channel.send(fn.spongebob(commandData)).then(() => {
				message.delete();
			});
		}
	}
}