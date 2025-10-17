import * as controller from '../database/controllers/GameSales.js';
import axios from 'axios';
import { connectToDatabase, closeDatabaseConnection } from '../utilities.js';
import {
	ButtonStyle,
	EmbedBuilder,
	ModalBuilder,
	ButtonBuilder,
	ComponentType,
	TextInputStyle,
	ActionRowBuilder,
	TextInputBuilder,
	SlashCommandBuilder,
	StringSelectMenuBuilder,
	StringSelectMenuOptionBuilder,
} from 'discord.js';

export const main = async () => {
	try {
		await connectToDatabase();
	}
	catch (e) {
		console.log(e);
		return;
	}

	const databaseGames = await controller.retrieveAll();
	const gameIds = databaseGames.map(game => game.cheapSharkId);

	const response = await queryCheapSharkGames(gameIds);

	for (let i = 0; i < databaseGames.length; i++) {
		const { cheapSharkId, current_price } = databaseGames[i];
		const { price: newPrice } = response.data[cheapSharkId].deals[0];

		switch (true) {
		case !current_price:
		case newPrice < current_price:
			await controller.updateGame(cheapSharkId, { current_price: newPrice });
			break;
		case newPrice > current_price:
			break;
		default:
			break;
		}
	}

	closeDatabaseConnection();
};

/* ********* */
/* API Calls */
/* ********* */
const queryCheapSharkGames = async (ids) => {
	const response = await axios.get(
		`https://www.cheapshark.com/api/1.0/games?ids=${ids.toString()}`,
	);
	return response;
};

/* ********** */
/* Components */
/* ********** */
const createGameSaleEmbed = () => {

};