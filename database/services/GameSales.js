import model from './../models/GameSales.js';

export const addGame = async (cheapSharkId, title) => {
	return model.create({ cheapSharkId, title });
};
export const findGame = async (cheapSharkId) => {
	return model.findOne({ cheapSharkId });
};
export const removeGame = async (cheapSharkId) => {
	return model.deleteOne({ cheapSharkId });
};
export const updateGame = async (cheapSharkId, update) => {
	return model.findOneAndUpdate({ cheapSharkId }, update);
};
export const retrieveAll = async () => {
	return model.find();
};
