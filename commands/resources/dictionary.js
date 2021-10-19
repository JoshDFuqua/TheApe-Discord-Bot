const axios = require('axios').default;

require('dotenv').config();
const dictToken = process.env.DICT_TOKEN;

module.exports = {
	name: 'define',
  description: 'Get the definition of a word',
  args: true,
	execute(message, args) {

    axios({
      method: 'GET',
      url: `https://www.dictionaryapi.com/api/v3/references/collegiate/json/${args[0]}?key=${dictToken}`
    })
    .then(response => {
      let definition = `Here's the definition for the word ${args[0]}:\n\n${response.data[0].shortdef[0]}`

      message.channel.send({content: definition, components: null, embeds: null})
    })


	}
};
