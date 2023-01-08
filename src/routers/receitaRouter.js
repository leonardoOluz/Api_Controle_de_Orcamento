import express from 'express';
import receitaController from '../controllers/receitaController.js';

const router = express.Router();

router
  .post('/receitas', receitaController.cadastrarReceitas);


export default router;
