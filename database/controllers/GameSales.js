import service from '../services/GameSales.js';

const addGame = async (req, res) => {
	const { title, price } = req.query;
	try {
		await service.addGame(title, price);
		res.json({ status: 201 });
	}
	catch (err) {
		res.status(500).json({ error: err.message });
	}
};
const findGame = async (req, res) => {
	const { title } = req.query;
	try {
		const game = await service.findGame(title);
		res.json({ data: game, status: 200 });
	}
	catch (err) {
		res.status(500).json({ error: err.message });
	}
};
const removeGame = async (req, res) => {
	const { title } = req.query;
	try {
		await service.removeGame(title);
		res.json({ status: 200 });
	}
	catch (err) {
		res.status(500).json({ error: err.message });
	}
};

export default { addGame, findGame, removeGame };