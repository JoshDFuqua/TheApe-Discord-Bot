import * as dotenv from 'dotenv';
import axios from 'axios';
import { ComponentType } from 'discord.js';
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

		try {
			const { data: cheapSharkGames } = await queryCheapSharkGames(gameTitle);
			let sendGamesList;
			if (cheapSharkGames.length <= 25) {
				const gamesListSelect = createGamesListSelect(cheapSharkGames);
				sendGamesList = await interaction.editReply({ components: gamesListSelect });
			}
			// Handles pagination
			else {
				let currentIndex = 0;
				let gamesListSelect = createGamesListSelect(cheapSharkGames);
				sendGamesList = await interaction.editReply({ components: gamesListSelect });

				const buttonWatcher = sendGamesList.createMessageComponentCollector({ componentType: ComponentType.Button, time: 180000 });
				buttonWatcher.on('collect', async i => {
					i.deferUpdate();

					if (i.customId === 'next') {
						currentIndex += 25;
					}
					else {
						currentIndex -= 25;
					}
					gamesListSelect = createGamesListSelect(cheapSharkGames, currentIndex);
					sendGamesList = await interaction.editReply({ components: gamesListSelect });
				});
			}

			const selectResponse = await sendGamesList.awaitMessageComponent({ filter: (i) => i.customId === 'games_list' && userFilter(i) });
			const gameID = selectResponse.values[0];

			const gameInDatabase = await checkDatabase(gameID);

			selectResponse.reply({ content: 'Checking to see if we already have this one...', ephemeral: true });
			selectResponse.deleteReply();

			if (gameInDatabase) {
				interaction.editReply({ content: 'That game is already being tracked!', components: [] });
			}
			else {
				const [ gameInfo ] = cheapSharkGames.filter(g => g.gameID === gameID);
				const saveSuccess = await saveToDatabase(gameInfo);
				const responseMessage = saveSuccess ? 'Game is now being tracked.' : 'It seems I had a problem saving the game.  Try again later.';
				interaction.editReply({ content: responseMessage, components: [] });
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

/* ********* */
/* API Calls */
/* ********* */
const queryCheapSharkGames = async (title) => {
	return axios.get(`https://www.cheapshark.com/api/1.0/games?title=${title}`);
};

const checkDatabase = async (gameID) => {
	const response = await axios.get(
		'http://localhost:3001/api/gamesales',
		{
			params: {
				gameID,
			},
			validateStatus: false,
		});

	return response.status === 200;
};

const saveToDatabase = async ({ gameID, external: title }) => {
	const response = await axios.post(
		'http://localhost:3001/api/gamesales',
		null,
		{
			params: {
				gameID,
				title,
			},
			validateStatus: false,
		});

	return response.status === 201;
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

	currentGamesListSection.forEach(({ gameID, external: title }) => {
		gamesSelectOptions.push(
			new StringSelectMenuOptionBuilder()
				.setLabel(title)
				.setValue(gameID),
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
