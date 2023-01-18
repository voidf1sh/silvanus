const fn = require('../functions.js');
const config = require('../config.json');

module.exports = {
	name: 'setmessage',
	alias: 'sm',
	description: 'Set the message to be used for rank analysis',
	usage: 'Reply to the Tree Ranking message with .setmessage',
	execute(message, commandData) {
		if (message.reference != undefined) {
			const repliedMessageId = message.reference.messageId;
			message.channel.messages.fetch(repliedMessageId)
				.then(repliedMessage => {
					console.log(repliedMessage.embeds[0].data.description);
					message.reply('ID: ' + repliedMessage.id);
				})
				.catch(err => {
					console.error(err);
					message.reply('There was a problem fetching the message.');
				});
		} else {
			message.reply('You must reply to the message');
		}
	}
}