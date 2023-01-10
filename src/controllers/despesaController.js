import Despesas from '../model/Despesas.js';

class despesasControllers {
    static cadastrarDespesas = (req, res) => {
        /* Criando variaveis para o corpo da requisição */
        const { descricao, valor, data } = req.body;
        const despesa = new Despesas({ descricao, valor, data });
        /* Verificar se o corpo da requisição está preenchido e data com formato valido */
        if (!descricao) {
            res.status(422).json({ msg: `Por favor preencha o campo "descrição".` });
        } else if (!valor) {
            res.status(422).json({ msg: `Por favor preencha o campo "valor"` });
        } else if (!data || (data.length < 10)) {
            res.status(422).json({ msg: `Por favor preencha a data no formato "YYYY-MM-DD"` })
        } else {
            /*  Verificar se existe outra descrição idêntica */
            Despesas.findOne({ 'descricao': descricao }, (err, dbDespesas) => {
                /* Verifica se há erro  */
                if (!err) {
                    /* Verificar se há outra descrição */
                    if (!dbDespesas) {
                        /* Se não ouver outra descrição será salvo no banco a nova despesa */
                        despesa.save((err) => {
                            if (!err) {
                                res.status(201).json({ msg: `Cadastrado` })
                            } else {
                                res.status(500).json({ msg: `Erro ao cadastrar, tente novamento mais tarde!` })
                            }
                        });
                    } else {
                        res.status(422).json({ msg: `Já existe uma descrição do mesmo nome, por favor atualize a mesmo ou crie outra descrição.` })
                    }
                }
            })
        }
    }
}

export default despesasControllers;
