import express from 'express';
import receitaController from '../controllers/receitaController.js';

const router = express.Router();

router
  .post('/receitas', receitaController.cadastrarReceitas)
  .get('/receitas/',receitaController.listarTodasReceitas)
  .get('/receitas/:id', receitaController.detalhesReceitaId)
  .put('/receitas/:id',receitaController.atualizarDadosReceitaId)
  .delete('/receitas/:id',receitaController.deletarReceitaPorId)


export default router;
