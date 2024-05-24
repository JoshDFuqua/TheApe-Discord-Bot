import axios from 'axios';
import * as dotenv from 'dotenv';
import { SlashCommandBuilder } from 'discord.js';

dotenv.config();
const dictToken = process.env.DICT_TOKEN;

export const data = new SlashCommandBuilder()
	.setName('define')
	.setDescription('Get the definition of a word.')
	.addStringOption(option =>
		option.setName('word')
			.setDescription('word to be defined')
			.setRequired(true),
	);
export function execute(interaction) {
	const searchWord = interaction.options.getString('word');

	axios({
		method: 'GET',
		url: `https://www.dictionaryapi.com/api/v3/references/collegiate/json/${searchWord}?key=${dictToken}`,
	})
		.then(response => {
			if (response.data[0].shortdef === undefined) {
				let possibleWords = '';

				for (const word in response.data) {
					possibleWords += response.data[word] + '\n';
				}
				const responseMsg = 'I was unable to find the definition for that word.  Maybe you meant to search for one of these instead:\n\n' + possibleWords;
				interaction.reply({ content: responseMsg, components: null, embeds: null });
			}
			else {
				const definition = `Here's the definition for the word "${searchWord}":\n\n${response.data[0].shortdef[0]}`;
				interaction.reply({ content: definition, components: null, embeds: null });
			}
		});
}