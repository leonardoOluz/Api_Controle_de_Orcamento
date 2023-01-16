import express from 'express';
import usuario from '../controllers/usuarioController.js';

const router = express.Router();

router
    .post('/usuario', usuario.cadastrarUsuario)

export default router;
