import service from '../services/GameSales.js';

	const { gameID, title } = req.query;
	try {
		await service.addGame(gameID, title);
		res.status(201).end();
const handleGet = async (req, res) => {
	}
	catch (err) {
		res.status(500).json({ error: err.message });
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