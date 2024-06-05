import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const gameSalesSchema = new Schema({
	title: {
		type: String,
		index: true,
		unique: true,
		required: true,
	},
	cheapSharkId: {
		type: Number,
		index: true,
		unique: true,
		required: true,
	},
	current_price: {
		type: Number,
	},
});

export default mongoose.model('GameSales', gameSalesSchema, 'GameSales');
