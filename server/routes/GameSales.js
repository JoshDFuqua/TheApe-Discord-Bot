import express from 'express';
import controller from '../../database/controllers/GameSales.js';

const { handleGet, handlePost, handleDelete } = controller;

const router = express.Router();

router.route('/').get(handleGet).post(handlePost).delete(handleDelete);

export default router;