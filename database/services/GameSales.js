import model from './../models/GameSales.js';

const addGame = async (cheapSharkId, title) => {
	return model.create({ cheapSharkId, title });
};
const findGame = async (cheapSharkId) => {
	return model.findOne({ cheapSharkId });
};
const removeGame = async (cheapSharkId) => {
	return model.deleteOne({ cheapSharkId });
};

export default { addGame, findGame, removeGame };