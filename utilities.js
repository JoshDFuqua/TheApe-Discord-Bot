import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const path = resolve(__dirname, '..', '.env');
dotenv.config({ path });

export const connectToDatabase = async () => {
	return mongoose.connect(process.env.DBURI, { maxPoolSize: 10 }).then(_ => console.log('Connected to MongoDB.'));
};

export const closeDatabaseConnection = async () => {
	return mongoose.disconnect().then(() => console.log('Connection closed.'));
};