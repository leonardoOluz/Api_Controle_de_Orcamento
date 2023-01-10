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
    static listagemDeDespesas = (req, res) => {
        Despesas.find((err, dbDespesas) => {
            if (!err) {
                res.status(200).json(dbDespesas)
            } else {
                res.status(500).json({ msg: `Não foi possível listar as despesas tente novamente mais tarde!` })
            }
        })
    }
    static detalharDespesaPorId = (req, res) => {
        /* Criando variavel id para armazenar os paramentros da requisição */
        const id = req.params.id;
        /*  Verificando no banco a existência do id */
        Despesas.findById(id, (err, dbDespesa) => {
            if(dbDespesa){
                /*  Se acaso existir o mesmo é enviado em formado json*/
                if(!err){
                    res.status(200).json(dbDespesa);
                }else {
                    res.status(500).json({msg: `${err.message} Erro ao requisitar o servidor, tente novamente mais tarde!`})
                }
            } else { // se não ouver os dados é enviado uma msg informando a inexistência do dado
                res.status(422).json({msg: `Não foi possível identificar o id: ${id}, O mesmo pode não existir no banco de dados! `})
            }
        })        

    }
    static atualizarDespesaPorId = (req, res) => {
        /* Criando variaveis para os parâmentros */
        const {descricao, valor, data} = req.body;
        const id = req.params.id;
        if (!descricao) {
            res.status(422).json({ msg: `Descrição é obrigatório!` });
        } else if (!valor) {
            res.status(422).json({ msg: `Valor é obrigatório!` });
        } else if (!data || (data.length < 10)) {
            res.status(422).json({ msg: `Por favor preencha a data no formato "YYYY-MM-DD"` });
        } else {
            res.status(200).json({msg: `Ok`})
        }        
    }
}

export default despesasControllers;
