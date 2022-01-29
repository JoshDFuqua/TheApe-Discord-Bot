const fs = require('fs');
const readline = require('readline');
const { google } = require('googleapis');
const { Base64 } = require('js-base64')
const puppeteer = require('puppeteer');
const Discord = require('discord.js');

// If modifying these scopes, delete token.json.
const SCOPES = ['https://mail.google.com'];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = 'token.json';

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
 function authorize(credentials, callback) {
  const {client_secret, client_id, redirect_uris} = credentials.installed;
  const oAuth2Client = new google.auth.OAuth2(
      client_id, client_secret, redirect_uris[0]);

  // Check if we have previously stored a token.
  fs.readFile(TOKEN_PATH, (err, token) => {
    if (err) return getNewToken(oAuth2Client, callback);
    oAuth2Client.setCredentials(JSON.parse(token));
    callback(oAuth2Client);
  });
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback for the authorized client.
 */
function getNewToken(oAuth2Client, callback) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });
  console.log('Authorize this app by visiting this url:', authUrl);
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  rl.question('Enter the code from that page here: ', (code) => {
    rl.close();
    oAuth2Client.getToken(code, (err, token) => {
      if (err) return console.error('Error retrieving access token', err);
      oAuth2Client.setCredentials(token);
      // Store the token to disk for later program executions
      fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
        if (err) return console.error(err);
        console.log('Token stored to', TOKEN_PATH);
      });
      callback(oAuth2Client);
    });
  });
}

function getNews(message) {
  fs.readFile('credentials.json', (err, content) => {
    if (err) return console.log('Error loading client secret file:', err);
    authorize(JSON.parse(content), async authorization => { // Functionality to post the news to server all happens within here

      const gmail = google.gmail({version: 'v1', auth: authorization});

      const res = await gmail.users.messages.list({
        includeSpamTrash: false,
        labelIds: `Label_3799359383675806945`,
        maxResults: 1,
        userId: 'me',
      });

      if (res.data.messages.length === 0) return;

      let msg = await gmail.users.messages.get({
        format: 'raw',
        id: res.data.messages[0].id,
        userId: 'me',
      });

      let doc = Base64.decode(msg.data.raw)
        .replace(/=(\r\n|\n|\r)/g, '')
        .replace(/[=]+(?![^<]*>)/g, '')
        .replace(/&amp;/g, '&')
        .replace(/&quot;/g, '')
        .replace(/(?<!\>)3D(?![\w\s]*[\<])/g, '')
        .replace(/(.)E2809C(.)/g, `$1"$2`)
        .replace(/(.)E2809D(.)/g, `$1"$2`)
        .replace(/(.)E28099(.)/g, `$1'$2`)
        .replace(/([A-z]+)20/g,'$1')
        .replace(/C2A0/g,'');

      fs.writeFile('todayStory.html', doc, (err) => {
        if (err) console.log(err)
      });

      const embed = new Discord.MessageEmbed()
        .setTitle('Daily News');

      (async () => {
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        await page.goto('file:///Users/joshfuqua/Discord Bot/todayStory.html');
        let posts = await page.$$('li');

        for (let i = 0; i < posts.length; i++) {
          let postContent = `${await (await posts[i].getProperty('textContent')).jsonValue()}`;
          let links = await posts[i].$$('a');

          for (let j = 0; j < links.length; j++) {
            let href = `${await (await links[j].getProperty('href')).jsonValue()}`;
            let linkText = `${await (await links[j].getProperty('textContent')).jsonValue()}`;

            postContent = postContent.replace(linkText, `[${linkText}] (${href})`)
          }
          embed.addField('\u200B', postContent)
        }
        await browser.close();
      })();
      message.channel.send({content: null, embeds: [embed]})

    });
  });
};

getNews()

module.exports = {
  getNews
}


module.exports = {
  name: 'news',
  description: 'news test',
  execute(message, args, client) {
    getNews(message);
  },
};