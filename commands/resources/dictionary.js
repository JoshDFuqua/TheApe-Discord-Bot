import * as dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();
const dictToken = process.env.DICT_TOKEN;

export const name = 'define';
export const description = 'Get the definition of a word';
export const args = true;
export function execute(message, otherArgs) {
	let searchWord = '';

	for (word in otherArgs) {
		searchWord += otherArgs[word] + ' ';
	}
	searchWord = searchWord.trim();

	axios({
		method: 'GET',
		url: `https://www.dictionaryapi.com/api/v3/references/collegiate/json/${searchWord}?key=${dictToken}`,
	})
		.then(response => {
			if (response.data[0].shortdef === undefined) {
				let possibleWords = '';

				for (word in response.data) {
					possibleWords += response.data[word] + '\n';
				}
				const responseMsg = 'I was unable to find the definition for that word.  Maybe you meant to search for one of these instead:\n\n' + possibleWords;
				message.channel.send({ content: responseMsg, components: null, embeds: null });
			}
			else {
				const definition = `Here's the definition for the word "${searchWord}":\n\n${response.data[0].shortdef[0]}`;
				message.channel.send({ content: definition, components: null, embeds: null });
			}
		});
}