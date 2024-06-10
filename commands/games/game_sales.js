import * as dotenv from 'dotenv';
import * as controller from '../../database/controllers/GameSales.js';
import axios from 'axios';
import { ComponentType } from 'discord.js';
import { connectToDatabase, closeDatabaseConnection } from '../../utilities.js';
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

export const data = new SlashCommandBuilder()
	.setName('gamesales')
	.setDescription('Add or remove games from the game sale watchlist.');

export async function execute(interaction) {
	const userFilter = i => i.user.id === interaction.user.id;

	try {
		await connectToDatabase();
	}
	catch (e) {
		console.log(e);
		return;
	}

	const MainMenu = createMainMenu();
	const sendMenu = await interaction.reply({
		components: [MainMenu],
	});
	const menuResponse = await sendMenu.awaitMessageComponent({ filter: userFilter });

	if (menuResponse.customId === 'add_game') {
		await menuResponse.showModal(createAddGameModal());

		const modalResponse = await interaction.awaitModalSubmit({ time: 30000 });
		const gameTitle = modalResponse.fields.getTextInputValue('game_title');
		modalResponse.reply({ content: 'Looking through my list of games...', ephemeral: true });
		modalResponse.deleteReply();


		let cheapSharkGames;
		try {
			cheapSharkGames = await queryCheapSharkGames(gameTitle);
		}
		catch (e) {
			interaction.editReply({ content: 'It appears the place I get all my info from is currently down.  Try again later.', components: [] });
			console.log(e);
			return;
		}

		if (cheapSharkGames.length === 0) {
			interaction.editReply({ content: 'I didn\'t find anything by that name.  Check for any misspellings, make sure the game you\'re looking for actually exists, and try again!', components: [] });
			return;
		}

		let sendGamesList;
		if (cheapSharkGames.length <= 25) {
			const GamesListSelect = createGamesListSelect(cheapSharkGames);
			sendGamesList = await interaction.editReply({ components: GamesListSelect });
		}
		// Discord select menus can only hold 25 options at a time
		else {
			let currentIndex = 0;
			let GamesListSelect = createGamesListSelect(cheapSharkGames);
			sendGamesList = await interaction.editReply({ components: GamesListSelect });

			const buttonWatcher = sendGamesList.createMessageComponentCollector({ componentType: ComponentType.Button, time: 180000 });
			buttonWatcher.on('collect', async (i) => {
				i.deferUpdate();

				if (i.customId === 'next') {
					currentIndex += 25;
				}
				else {
					currentIndex -= 25;
				}
				GamesListSelect = createGamesListSelect(cheapSharkGames, currentIndex);
				sendGamesList = await interaction.editReply({ components: GamesListSelect });
			});
		}
		const selectResponse = await sendGamesList.awaitMessageComponent({ filter: (i) => i.customId === 'games_list' && userFilter(i) });
		const cheapSharkId = selectResponse.values[0];

		selectResponse.reply({ content: 'Checking to see if we already have this one...', ephemeral: true });
		selectResponse.deleteReply();

		let databaseResponse;
		try {
			databaseResponse = await controller.findGame(cheapSharkId);
		}
		catch (e) {
			closeDatabaseConnection();
			interaction.editReply({ content: 'I had some trouble talking to the database.  Try again later!', components: [] });
			console.log(e);
			return;
		}

		if (databaseResponse) {
			interaction.editReply({ content: 'That game is already being tracked!', components: [] });
			return;
		}
		else {
			const [ gameInfo ] = cheapSharkGames.filter(g => g.cheapSharkId === cheapSharkId);
			try {
				await controller.addGame(gameInfo.cheapSharkId, gameInfo.title);
				interaction.editReply({ content: 'Game is now being tracked.', components: [] });
				return;
			}
			catch (e) {
				closeDatabaseConnection();
				interaction.editReply({ content: 'It seems I had a problem saving the game.  Try again later!', components: [] });
				console.log(e);
				return;
			}
		}
	}
	else {
		menuResponse.reply({ content: 'Checking the database...', components: [] });
		menuResponse.deleteReply();

		let games;
		try {
			games = await controller.retrieveAll();
		}
		catch (e) {
			closeDatabaseConnection();
			interaction.editReply({ content: 'I had some trouble talking to the database.  Try again later!', components: [] });
			console.log(e);
			return;
		}

		if (games.length === 0) {
			interaction.editReply({ content: 'I\'m not tracking anything!', components: [] });
			return;
		}
		const GamesListSelect = createGamesListSelect(games);
		const sendGamesList = await interaction.editReply({ components: GamesListSelect });
		const selectResponse = await sendGamesList.awaitMessageComponent({ filter: (i) => i.customId === 'games_list' && userFilter(i) });
		const cheapSharkId = selectResponse.values[0];

		selectResponse.reply({ content: 'Deleting game...', ephemeral: true });
		selectResponse.deleteReply();

		try {
			await controller.removeGame(cheapSharkId);
			interaction.editReply({ content: 'Game has been deleted.', components: [] });
			return;
		}
		catch (e) {
			closeDatabaseConnection();
			interaction.editReply({ content: 'It seems I had a problem deleting the game.  Try again later!', components: [] });
			console.log(e);
			return;
		}
	}
}

/* ********* */
/* Utilities */
/* ********* */
const normalizeCheapSharkData = (cheapSharkData) => {
	return cheapSharkData.map((game) => {
		return {
			cheapSharkId: game.gameID,
			title: game.external,
		};
	});
};

/* ********* */
/* API Calls */
/* ********* */
const queryCheapSharkGames = async (title) => {
	const response = await axios.get(
		`https://www.cheapshark.com/api/1.0/games?title=${title}`,
		{
		});
	return normalizeCheapSharkData(response.data);
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

const createGamesListSelect = (games, currentIndex = 0) => {
	const currentGamesListSection = games.slice(currentIndex, currentIndex + 25);

	const selectContainer = new ActionRowBuilder();
	const gamesSelect = new StringSelectMenuBuilder()
		.setCustomId('games_list')
		.setPlaceholder('Select the correct title');
	const gamesSelectOptions = [];

	currentGamesListSection.forEach(({ cheapSharkId, title }) => {
		gamesSelectOptions.push(
			new StringSelectMenuOptionBuilder()
				.setLabel(title)
				.setValue(`${cheapSharkId}`),
		);
	});
	gamesSelect.addOptions(gamesSelectOptions);
	selectContainer.addComponents(gamesSelect);

	if (games.length <= 25) return [ selectContainer ];

	const canNavigateBack = games[currentIndex - 25] !== undefined;
	const canNavigateForward = games[currentIndex + 25] !== undefined;
	const buttonContainer = new ActionRowBuilder();
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
	buttonContainer.addComponents(prevButton, nextButton);

	return [ selectContainer, buttonContainer ] ;
};
