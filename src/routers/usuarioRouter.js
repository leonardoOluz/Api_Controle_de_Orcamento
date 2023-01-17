import express from 'express';
import usuarioController from '../controllers/usuarioController.js';

const router = express.Router();

router
    .post('/usuario', usuarioController.cadastrarUsuario)
    .post('/usuario/login/token',usuarioController.logarUsuarioToken)
    .get('/usuario/:id', usuarioController.acessarUsuarioPorId)

export default router;
