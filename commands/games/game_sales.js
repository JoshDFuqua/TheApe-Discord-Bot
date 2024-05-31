import * as dotenv from 'dotenv';
import axios from 'axios';
import { ComponentType, EmbedBuilder } from 'discord.js';
import {
	ButtonStyle,
	ModalBuilder,
	ButtonBuilder,
	TextInputStyle,
	ActionRowBuilder,
	TextInputBuilder,
	SlashCommandBuilder,
	StringSelectMenuBuilder,
	StringSelectMenuOptionBuilder,
} from 'discord.js';

dotenv.config();
const dummyQueryResponse = [{ external: 'Maybe', gameID: '1234' }];


export const data = new SlashCommandBuilder()
	.setName('gamesales')
	.setDescription('Add or remove games from the game sale watchlist.');

export async function execute(interaction) {
	const collectorFilter = i => i.user.id === interaction.user.id;

	const MainMenu = createMainMenu();
	const sendMenu = await interaction.reply({
		components: [MainMenu],
	});
	const menuResponse = await sendMenu.awaitMessageComponent({ filter: collectorFilter });

	if (menuResponse.customId === 'add_game') {
		await menuResponse.showModal(createAddGameModal());

		const modalResponse = await interaction.awaitModalSubmit({ time: 30_000 });
		const gameTitle = modalResponse.fields.getTextInputValue('game_title');
		modalResponse.reply({ content: 'Looking through my list of games...', ephemeral: true });
		modalResponse.deleteReply();

		try {
			const { data: games } = await queryCheapShark(gameTitle);

			let gamesListSelect;
			let sendGamesList;
			if (games.length <= 25) {
				gamesListSelect = createGamesListSelect(games);
				sendGamesList = await interaction.editReply({ components: gamesListSelect });
			}
			// Handles pagination
			else {
				let currentIndex = 0;
				gamesListSelect = createGamesListSelect(games.slice(0, 25));
				sendGamesList = await interaction.editReply({ components: gamesListSelect });

				const buttonWatcher = sendGamesList.createMessageComponentCollector({ ComponentType: ComponentType.Button, time: 180000 });
				buttonWatcher.on('collect', async i => {
					i.deferUpdate();

					if (i.customId === 'next') {
						currentIndex += 25;
					}
					else {
						currentIndex -= 25;
					}

					const canNavigateBack = games[currentIndex - 25] !== undefined;
					const canNavigateForward = games[currentIndex + 25] !== undefined;
					const currentGamesListSegment = games.slice(currentIndex, currentIndex + 25);
					console.log(canNavigateForward);
					gamesListSelect = createGamesListSelect(currentGamesListSegment, canNavigateBack, canNavigateForward);
					sendGamesList = await interaction.editReply({ components: gamesListSelect });
				});
			}

			const selectResponse = await sendGamesList.awaitMessageComponent({ filter: collectorFilter });

			const gameInDatabase = await checkDatabase(selectResponse.values[0]);

			selectResponse.reply({ content: 'Checking to see if we already have this one...', ephemeral: true });
			selectResponse.deleteReply();

			if (gameInDatabase) {
				interaction.editReply({ content: 'That game is already being tracked!', components: [] });
			}
		}
		catch (e) {
			console.log(e);
		}

	}
	else {
		console.log('else');
	}
}

const queryCheapShark = async (title) => {
	return axios({
		method: 'GET',
		url: `https://www.cheapshark.com/api/1.0/games?title=${title}`,
	});
};

const checkDatabase = async (title) => {
	const request = await axios.get(
		'http://localhost:3001/api/gamesales',
		null,
		{
			params: {
				title,
			},
		});

	return request.status === 200;
};

/* ********** */
/* Components */
/* ********** */
const createMainMenu = () => {
	const add = new ButtonBuilder()
		.setCustomId('add_game')
		.setLabel('Add Game')
		.setStyle(ButtonStyle.Primary);

	const remove = new ButtonBuilder()
		.setCustomId('remove_game')
		.setLabel('Remove Game')
		.setStyle(ButtonStyle.Danger);

	const row = new ActionRowBuilder()
		.addComponents(add, remove);

	return row;
};

const createAddGameModal = () => {
	const modal = new ModalBuilder()
		.setCustomId('game_sale_modal')
		.setTitle('Game Sales');
	const gameTitleInput = new TextInputBuilder()
		.setCustomId('game_title')
		.setLabel('Which game are you looking for?')
		.setStyle(TextInputStyle.Short);
	const row = new ActionRowBuilder().addComponents(gameTitleInput);

	modal.addComponents(row);
	return modal;
};

const createGamesListSelect = (games, canNavigateBack = false, canNavigateForward = true) => {
	const buttonContainer = new ActionRowBuilder();
	const selectContainer = new ActionRowBuilder();
	const prevButton = new ButtonBuilder()
		.setCustomId('previous')
		.setLabel('<-')
		.setStyle(ButtonStyle.Secondary)
		.setDisabled(!canNavigateBack);
	const nextButton = new ButtonBuilder()
		.setCustomId('next')
		.setLabel('->')
		.setStyle(ButtonStyle.Secondary)
		.setDisabled(!canNavigateForward);
	const gamesList = new StringSelectMenuBuilder()
		.setCustomId('games_list')
		.setPlaceholder('Select the correct title');
	const gamesListOptions = [];

	games.forEach(({ external: title }) => {
		gamesListOptions.push(
			new StringSelectMenuOptionBuilder()
				.setLabel(title)
				.setValue(title),
		);
	});
	gamesList.addOptions(gamesListOptions);

	buttonContainer.addComponents(prevButton, nextButton);
	selectContainer.addComponents(gamesList);

	return [ selectContainer, buttonContainer ];
};
