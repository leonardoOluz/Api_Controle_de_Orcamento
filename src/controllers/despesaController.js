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
            if (dbDespesa) {
                /*  Se acaso existir o mesmo é enviado em formado json*/
                if (!err) {
                    res.status(200).json(dbDespesa);
                } else {
                    res.status(500).json({ msg: `${err.message} Erro ao requisitar o servidor, tente novamente mais tarde!` })
                }
            } else { // se não ouver os dados é enviado uma msg informando a inexistência do dado
                res.status(422).json({ msg: `Não foi possível identificar o id: ${id}, O mesmo pode não existir no banco de dados! ` })
            }
        })

    }
    static atualizarDespesaPorId = (req, res) => {
        /* Criando variaveis para os parâmentros */
        const { descricao, valor, data } = req.body;
        const id = req.params.id;
        if (!descricao) {
            res.status(422).json({ msg: `Descrição é obrigatório!` });
        } else if (!valor) {
            res.status(422).json({ msg: `Valor é obrigatório!` });
        } else if (!data || (data.length < 10)) {
            res.status(422).json({ msg: `Por favor preencha a data no formato "YYYY-MM-DD"` });
        } else {
            /* Verificar a existencia do id no banco de dados */
            Despesas.findById(id, (err, dbDespesa) => {
                /* verificando erro de servidor caso não, entra no if*/
                if (!err) {
                    /* Criando variaveis de controle de data */
                    const dbData = Number(dbDespesa.data.slice(5, 7))
                    const dataNew = Number(data.slice(5, 7))
                    /* Verificando se retorna dados do banco */
                    if (dbDespesa) {
                        /* Verificar se as descrições são a mesma */
                        if (dbDespesa.descricao !== descricao) {
                            /* Se a descrição forem diferentes verificar outros descrições no banco */
                            Despesas.findOne({ 'descricao': descricao }, (err, dbPorDescricao) => {                                
                                if (!err) {
                                    /* Se ouver descrição informar há existência da descrição e solicitar que atualize a descrição ou crie outra*/
                                    if (dbPorDescricao) {
                                        res.status(200).json({ msg: `Não é possível atualizar, descrição existente! Atualize a descrição informada por id ou crie outra despesa.` })
                                    } else {
                                        /* Se não existir outra descrição informada, verificar data se igual ou superior a atual*/
                                        if(dataNew >= dbData){
                                            Despesas.findByIdAndUpdate(id, { $set: req.body }, (err) => {
                                                if (!err) {
                                                    res.status(201).json({ msg: `Atualizado com descrição nova` })
                                                } else {
                                                    res.status(422).json({ msg: `Erro para atualizar, verifique o ID` })
                                                }
                                            })
                                        } else { // se data for for da atual informar data invalida
                                            res.status(422).json({ msg: `data inferior a informada, coloque uma data válida` })
                                        }                          
                                    }
                                } else {
                                    res.status(500).json({ msg: `Não foi possivel pesquisar pela descrição` })
                                }
                            })

                        } else {
                            /* Se as descrições forem iguais, verificar as datas */

                            if (dataNew >= dbData) {
                                /* Se a data for igual ou maior  */
                                Despesas.findByIdAndUpdate(id, { $set: req.body }, (err) => {
                                    /* Atualizar com mesma descrição */
                                    if (!err) {
                                        res.status(201).json({ msg: `Atualizado com a mesma descrição` })
                                    } else {
                                        res.status(500).json({ msg: `Erro para atualizar, verifique o ID` })
                                    }
                                })
                            } else {
                                /* Se for abaixo do informado enviar msg de data inválida */
                                res.status(422).json({ msg: `data inferior a informada, coloque uma data válida` })
                            }
                        }
                    } else {
                        /* Não ouver dados no banco, impossível atualizar */
                        res.status(422).json({ msg: `Não há dados no banco!` })
                    }

                } else {
                    /* Caso tiver erro manda msg de erro */
                    res.status(422).json({ msg: `Erro na requisição verifique o id informado!` })
                }
            })
        }
    }
}

export default despesasControllers;
