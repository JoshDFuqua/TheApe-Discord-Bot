import express from 'express';
import controller from '../../database/controllers/GameSales.js';

const { addGame, findGame, removeGame } = controller;

const router = express.Router();

router.route('/').get(findGame).post(addGame).delete(removeGame);

export default router;