import service from '../services/GameSales.js';

const addGame = async (req, res) => {
	const { gameID, title } = req.query;
	try {
		await service.addGame(gameID, title);
		res.status(201).end();
	}
	catch (err) {
		res.status(500).json({ error: err.message });
	}
};
const findGame = async (req, res) => {
	const { gameID } = req.query;
	try {
		const game = await service.findGame(gameID);
		res.status(game ? 200 : 404).json({ game });
	}
	catch (err) {
		res.status(500).json({ error: err.message });
	}
};
const removeGame = async (req, res) => {
	const { title } = req.query;
	try {
		await service.removeGame(title);
		res.status(200);
	}
	catch (err) {
		res.status(500).json({ error: err.message });
	}
};

export default { addGame, findGame, removeGame };