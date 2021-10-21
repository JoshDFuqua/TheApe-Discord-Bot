const axios = require('axios').default;

require('dotenv').config();
const dictToken = process.env.DICT_TOKEN;

module.exports = {
	name: 'define',
  description: 'Get the definition of a word',
  args: true,
	execute(message, args) {
    let searchWord = '';

    for (word in args) {
      searchWord += args[word] + ' '
    }
    searchWord = searchWord.trim();

    axios({
      method: 'GET',
      url: `https://www.dictionaryapi.com/api/v3/references/collegiate/json/${searchWord}?key=${dictToken}`
    })
    .then(response => {
      if (response.data[0].shortdef === undefined) {
        let possibleWords = '';

        for (word in response.data) {
          possibleWords += response.data[word] + '\n'
        }
        let responseMsg = 'I was unable to find the definition for that word.  Maybe you meant to search for one of these instead:\n\n' + possibleWords;
        message.channel.send({content: responseMsg, components: null, embeds: null})
      } else {
        let definition = `Here's the definition for the word "${searchWord}":\n\n${response.data[0].shortdef[0]}`
        message.channel.send({content: definition, components: null, embeds: null})
      }
    })
	}
};
