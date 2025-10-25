import * as dotenv from 'dotenv';
import fs from 'fs/promises';
import { EmbedBuilder } from 'discord.js';
import readline from 'readline';
import puppeteer from 'puppeteer';
import { Base64 } from 'js-base64';
import { google } from 'googleapis';

dotenv.config();

class NewsError extends Error {
    constructor(message, originalError) {
        super(message);
        this.name = 'NewsError';
        this.originalError = originalError;
    }
}

const config = {
    gmail: {
        scopes: ['https://mail.google.com'],
        tokenPath: 'token.json',
        sender: 'editors@thenewpaper.co'
    },
    paths: {
        local: 'file:///E:\\Users\\joshd\\Documents\\GitHub\\TheApe-Discord-Bot\\todayStory.html',
        server: 'file:///home\\TheApe-Discord-Bot\\todayStory.html',
        tempHtml: 'todayStory.html'
    },
    discord: {
        channelId: '977325210376208415'
    }
};

const environment = process.env.ENVIRONMENT;
const savedHtmlLocation = environment === 'Local' ? config.paths.local : config.paths.server;

export async function getNews(client) {
    try {
        const channel = await client.channels.fetch(config.discord.channelId);
        const credentials = await fs.readFile('credentials.json');
        const auth = await authorizeClient(JSON.parse(credentials));
        
        await channel.sendTyping();
        const newsData = await fetchLatestNews(auth);
        if (!newsData) {
            console.log('No news found');
            return;
        }

        const newsHtml = parseEmailToHTML(newsData);
        await saveNewsHtml(newsHtml);
        const newsEmbed = await createNewsEmbed(savedHtmlLocation);
        await channel.send({ embeds: [newsEmbed] });
    } catch (error) {
        console.error('Error in getNews:', error);
        throw new NewsError('Failed to process news', error);
    }
}

async function fetchLatestNews(auth) {
    const gmail = google.gmail({ version: 'v1', auth });
    const response = await gmail.users.messages.list({
        userId: 'me',
        maxResults: 1,
        q: `from:${config.gmail.sender}`,
        includeSpamTrash: false
    });

    if (!response.data.messages?.length) return null;

    return await gmail.users.messages.get({
        userId: 'me',
        id: response.data.messages[0].id,
        format: 'raw'
    });
}

async function saveNewsHtml(htmlContent) {
    await fs.writeFile(config.paths.tempHtml, htmlContent);
}

async function createNewsEmbed(htmlPath) {
    const browser = await puppeteer.launch();
    try {
        const page = await browser.newPage();
        await page.goto(htmlPath);
        const posts = await page.$$('li');
        const postFields = await processNewsPosts(posts);

        return new EmbedBuilder()
            .setTitle('Daily News')
            .addFields(postFields)
            .setFooter({
                text: 'News courtesy of The New Paper',
                iconURL: 'https://cdn.builder.io/api/v1/image/assets%2FdEjh2gs5h7b3cCl3oCR4dwZGjPr2%2Fdfb3347bb5934a5b8f2090c5915d6d2e?format=webp&width=1600&height=1200'
            });
    } finally {
        await browser.close();
    }
}

async function processNewsPosts(posts) {
    const postFields = [];
    for (const post of posts) {
        let postContent = await post.evaluate(el => el.textContent);
        const links = await post.$$('a');
        
        for (const link of links) {
            const [href, linkText] = await Promise.all([
                link.evaluate(el => el.href),
                link.evaluate(el => el.textContent)
            ]);
            postContent = postContent.replace(
                linkText,
                `[${linkText}](${href} 'Click to read further')`
            );
        }
        postFields.push({ name: '----------', value: postContent });
    }
    return postFields;
}

function parseEmailToHTML(msg) {
    return Base64.decode(msg.data.raw)
        .replace(/=(\r?\n|\r)/g, '')
        .replace(/[=]+(?![^<]*>)/g, '')
        .replace(/&amp;/g, '&')
        .replace(/&quot;/g, '')
        .replace(/(?<!\>)3D(?![\w\s]*[\<])/g, '')
        .replace(/(.)E2809[CD9](.)/g, '$1"$2')
        .replace(/([A-z]+)20/g, '$1')
        .replace(/C2A0/g, '');
}

async function authorizeClient(credentials) {
    const { client_secret, client_id, redirect_uris } = credentials.installed;
    const oAuth2Client = new google.auth.OAuth2(
        client_id,
        client_secret,
        redirect_uris[0]
    );

    try {
        const token = await fs.readFile(config.gmail.tokenPath);
        oAuth2Client.setCredentials(JSON.parse(token));
        return oAuth2Client;
    } catch (error) {
        return await getNewToken(oAuth2Client);
    }
}

async function getNewToken(oAuth2Client) {
    const authUrl = oAuth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: config.gmail.scopes,
        include_granted_scopes: true
    });

    console.log('Authorize this app by visiting this url:', authUrl);
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    try {
        const code = await new Promise((resolve) => {
            rl.question('Enter the code from that page here: ', resolve);
        });

        const { tokens } = await oAuth2Client.getToken(code);
        oAuth2Client.setCredentials(tokens);
        
        await fs.writeFile(config.gmail.tokenPath, JSON.stringify(tokens));
        console.log('Token stored to', config.gmail.tokenPath);
        
        return oAuth2Client;
    } finally {
        rl.close();
    }
}