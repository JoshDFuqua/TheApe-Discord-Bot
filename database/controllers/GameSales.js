import service from '../services/GameSales.js';

const handleGet = async (req, res) => {
	const { cheapSharkId } = req.query;

	if (cheapSharkId) {
		try {
			const game = await service.findGame(cheapSharkId);
			res.status(200).json(game);
		}
		catch (err) {
			res.status(500).json({ error: err.message });
		}
	}
	else {
		try {
			const games = await service.retrieveAll();
			res.status(200).json(games);
		}
		catch (err) {
			res.status(500).json({ error: err.message });
		}
	}
};
const handlePost = async (req, res) => {
	const { cheapSharkId, title } = req.query;
	try {
		await service.addGame(cheapSharkId, title);
		res.status(201).end();
	}
	catch (err) {
		res.status(500).json({ error: err.message });
	}
};
const handleDelete = async (req, res) => {
	const { cheapSharkId } = req.query;
	try {
		await service.removeGame(cheapSharkId);
		res.status(200).end();
	}
	catch (err) {
		res.status(500).json({ error: err.message });
	}
};

export default {
	handleGet,
	handlePost,
	handleDelete,
};