import model from './../models/GameSales.js';

const addGame = async (title, price) => {
	return await model.create({ title, current_price: price });
};
const findGame = async (title) => {
	return await model.findById(title);
};
const removeGame = async (title) => {
	return await model.findByIdAndDelete(title);
};

export default { addGame, findGame, removeGame };