import * as service from '../services/GameSales.js';

export const addGame = async (cheapSharkId, title) => {
	try {
		const databaseResponse = await service.addGame(cheapSharkId, title);
		return databaseResponse;
	}
	catch (err) {
		return err;
	}
};
export const findGame = async (cheapSharkId) => {
	try {
		const game = await service.findGame(cheapSharkId);
		return game;
	}
	catch (err) {
		return err;
	}
};
export const removeGame = async (cheapSharkId) => {
	try {
		const databaseResponse = await service.removeGame(cheapSharkId);
		return databaseResponse;
	}
	catch (err) {
		return err;
	}
};
export const updateGame = async (cheapSharkId, update = {}) => {
	try {
		const databaseResponse = await service.updateGame(cheapSharkId, update);
		return databaseResponse;
	}
	catch (err) {
		return err;
	}
};
export const retrieveAll = async () => {
	try {
		const games = await service.retrieveAll();
		return games;
	}
	catch (err) {
		return err;
	}
};
