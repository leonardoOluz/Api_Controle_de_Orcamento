import express from 'express';
import despesasControllers from '../controllers/despesaController.js';

const router = express.Router();

router
  .post('/despesas', despesasControllers.cadastrarDespesas)

export default router;
