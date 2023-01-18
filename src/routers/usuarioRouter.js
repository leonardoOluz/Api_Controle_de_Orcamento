import express from 'express';
import usuarioController from '../controllers/usuarioController.js';

const router = express.Router();

router
    .post('/usuario', usuarioController.cadastrarUsuario)
    .post('/usuario/login/token',usuarioController.logarUsuarioToken)
    .get('/usuario/:id', usuarioController.acessarUsuarioPorId)
    .put('/usuario/:id', usuarioController.atualizarUsuarioPorId)
    .delete('/usuario/:id', usuarioController.deletarUsuario)

export default router;
