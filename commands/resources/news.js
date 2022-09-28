const fs = require("fs");
const readline = require("readline");
const { google } = require("googleapis");
const { Base64 } = require("js-base64");
const puppeteer = require("puppeteer");
const Discord = require("discord.js");
require("dotenv").config();

// If modifying these scopes, delete token.json.
const SCOPES = ["https://mail.google.com"];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = "token.json";
const ENVIRONMENT = process.env.ENVIRONMENT; // Denotes whether code is being run from local or server
const localHtmlPath =
  "file:///E:\\Users\\joshd\\Documents\\GitHub\\TheApe-Discord-Bot\\todayStory.html";
const serverHtmlPath = "file:///home\\TheApe-Discord-Bot\\todayStory.html";
const savedHtmlLocation =
  ENVIRONMENT === "Local" ? localHtmlPath : serverHtmlPath;

function getNews(client) {
  console.log(client);
  client.channels
    .fetch("977325210376208415")
    .then((channel) => {
      fs.readFile("credentials.json", (err, content) => {
        if (err) return console.log("Error loading client secret file:", err);
        authorize(JSON.parse(content), async (authorization) => {
          channel.sendTyping();

          const gmail = google.gmail({ version: "v1", auth: authorization });

          const res = await gmail.users.messages.list({
            includeSpamTrash: false,
            maxResults: 1,
            q: "from:editors@thenewpaper.co",
            userId: "me",
          });

          if (res.data.messages.length === 0) return;

          let msg = await gmail.users.messages.get({
            format: "raw",
            id: res.data.messages[0].id,
            userId: "me",
          });

          let doc = parseEmailToHTML(msg);

          fs.writeFile("todayStory.html", doc, (err) => {
            if (err) console.log(err);
            else {
              let postArr = [];

              (async () => {
                const browser = await puppeteer.launch();
                const page = await browser.newPage();
                await page.goto(savedHtmlLocation);
                let posts = await page.$$("li");

                for (let i = 0; i < posts.length; i++) {
                  let postContent = `${await (
                    await posts[i].getProperty("textContent")
                  ).jsonValue()}`;
                  let links = await posts[i].$$("a");

                  for (let j = 0; j < links.length; j++) {
                    let href = `${await (
                      await links[j].getProperty("href")
                    ).jsonValue()}`;
                    let linkText = `${await (
                      await links[j].getProperty("textContent")
                    ).jsonValue()}`;

                    postContent = postContent.replace(
                      linkText,
                      `[${linkText}](${href} 'Click to read further')`
                    );
                  }
                  postArr.push({ name: "----------", value: postContent });
                }
                await browser.close();
                let embed = new Discord.MessageEmbed()
                  .setTitle("Daily News")
                  .addFields(...postArr)
                  .setFooter({
                    text: "News courtesy of The New Paper",
                    iconURL:
                      "https://cdn.builder.io/api/v1/image/assets%2FdEjh2gs5h7b3cCl3oCR4dwZGjPr2%2Fdfb3347bb5934a5b8f2090c5915d6d2e?format=webp&width=1600&height=1200",
                  });

                channel.send({ content: null, embeds: [embed] });
              })();
            }
          });
        });
      });
    })
    .catch((err) => console.log(err));
}

/****************/
/*** Helpers ****/
/****************/

function parseEmailToHTML(msg) {
  return Base64.decode(msg.data.raw)
    .replace(/=(\r?\n|\r)/g, "")
    .replace(/[=]+(?![^<]*>)/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, "")
    .replace(/(?<!\>)3D(?![\w\s]*[\<])/g, "")
    .replace(/(.)E2809[CD9](.)/g, `$1"$2`)
    .replace(/([A-z]+)20/g, "$1")
    .replace(/C2A0/g, "");
}

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(credentials, callback) {
  const { client_secret, client_id, redirect_uris } = credentials.installed;
  const oAuth2Client = new google.auth.OAuth2(
    client_id,
    client_secret,
    redirect_uris[0]
  );

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
    access_type: "offline",
    scope: SCOPES,
  });
  console.log("Authorize this app by visiting this url:", authUrl);
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  rl.question("Enter the code from that page here: ", (code) => {
    rl.close();
    oAuth2Client.getToken(code, (err, token) => {
      if (err) return console.error("Error retrieving access token", err);
      oAuth2Client.setCredentials(token);
      // Store the token to disk for later program executions
      fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
        if (err) return console.error(err);
        console.log("Token stored to", TOKEN_PATH);
      });
      callback(oAuth2Client);
    });
  });
}

module.exports = {
  name: "news",
  execute(message, args, client) {
    getNews(client);
  },
};
