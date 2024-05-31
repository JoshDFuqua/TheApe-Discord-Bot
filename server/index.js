import dotenv from 'dotenv';
import express from 'express';
import mongoose from 'mongoose';
import gameSalesRouter from './routes/GameSales.js';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const path = resolve(__dirname, '..', '.env');
dotenv.config({ path });

const app = express();
const PORT = 3001;

app.use(express.json());

try {
	// eslint-disable-next-line no-unused-vars
	mongoose.connect(process.env.DBURI, { maxPoolSize: 10 }).then(_ => console.log('Connected to MongoDB'));
}
catch (e) {
	console.log(e);
}

app.use('/api/gamesales', gameSalesRouter);

app.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}`);
});

export default app;
