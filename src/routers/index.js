import express from 'express';
import receitas from './receitaRouter.js';
import despesas from './despesaRouter.js';
import usuarios from './usuarioRouter.js';

const routers = (app) => {
    app.route('/').get((req, res) => {
        res.status(200).json({ msg: `Bem vindo a planilha para controle de orçamento` })
    })
    app.use(
        express.json(),
        receitas,
        despesas,
        usuarios
    )
}

export default routers;
