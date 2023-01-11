import Receitas from '../model/Receitas.js';

class receitasControllers {

    static cadastrarReceitas = (req, res) => {
        const { descricao, valor, data } = req.body;
        const receitas = new Receitas(
            {
                descricao,
                valor,
                data
            }
        )
        if (!descricao) {
            return res.status(422).json({ msg: `Preencha o campo "Descrição" Campo obrigátorio` })
        } else if (!valor) {
            return res.status(422).json({ msg: `Preencha o campo "Valor" Campo obrigátorio` })
        } else if (!data || (data.length < 10)) {
            return res.status(422).json({ msg: `Por favor preencha a data no formato "YYYY-MM-DD"` })
        } else {

            Receitas.find({ 'descricao': descricao })
                .exec((error, dbDescricao) => {
                    if (!error) {
                        /* Verificar se retorna objetos com descrição idênticas */
                        if (dbDescricao == '') {
                            /* Se não ouver descrição verificar a data atual */
                            const d = new Date();
                            const dataNow = d.getMonth();
                            /* Se a data for igual ou superior a informada salvar a nova receita */
                            if (Number(data.slice(5, 7)) >= (dataNow + 1)) {
                                receitas.save((err) => {
                                    if (!err) {
                                        res.status(201).json({ msg: `Receita cadastrada com sucesso!. Descrição nova` })
                                    } else {
                                        res.status(500).json({ message: `${err.message}` })
                                    }
                                })
                            } else { // se a data for inferior avisar que a data é inválida!
                                res.status(422).json({ msg: `Use uma data válida!` })
                            }
                        } else {
                            /* Função para percorrer todos os objetos com a mesma data */
                            let dataChecada = checkData(data, dbDescricao)
                            const d = new Date();
                            const dataNow = d.getMonth();
                            /* Verificar se a data não é inferior que a atual! */
                            if (Number(data.slice(5, 7)) >= (dataNow + 1)) {
                                /*  Se ouver data repetida com mesma descrição enviar mensagem de descrição e data repetida */
                                if (dataChecada.includes(Number(data.slice(5, 7)))) {
                                    res.status(201).json({ msg: `Já existe uma descrição com a mesma data! Se desejar atualize a descrição com data informada!` })
                                } else {// se não ouver data repetida com mesma descrição, criar nova receita
                                    receitas.save((err) => {
                                        if (!err) {
                                            res.status(201).json({ msg: `Receita cadastrada com sucesso!. mesma descrição data diferente` })
                                        } else {
                                            res.status(500).json({ message: `${err.message}` })
                                        }
                                    })
                                }
                            } else {
                                res.status(422).json({ msg: `Use uma data válida!` })
                            }
                        }
                    } else {
                        res.status(500).json({ msg: `Erro ao criar receita, tente novamente mais tarde!` })
                    }
                })
        }
        function checkData(data, dbDat) {
            let control = [];
            dbDat.forEach((obj) => {

                if (Number(data.slice(5, 7)) === Number(obj.data.slice(5, 7))) {
                    control.push(Number(obj.data.slice(5, 7)))
                }

            })
            console.log(control)
            return control;

        }
    }
    static listarTodasReceitas = (req, res) => {
        const descricao = req.query.descricao
        if (descricao) {
            Receitas.find({ 'descricao': descricao })
                .exec((erro, dbReceitas) => {
                    if (!erro) {
                        res.status(200).json(dbReceitas)
                    } else {
                        res.status(500).json({ msg: `Erro ao conectar ao servidor!. tente novamente mais tarde.` })
                    }
                })
        } else {
            Receitas.find()
                .exec((erro, dbReceitas) => {
                    if (!erro) {
                        res.status(200).json(dbReceitas)
                    } else {
                        res.status(500).json({ msg: `Erro ao conectar ao servidor!. tente novamente mais tarde.` })
                    }
                })
        }


    }
    static detalhesReceitaId = (req, res) => {
        const id = req.params.id;
        Receitas.findById(id, (err, dbReceita) => {
            if (!dbReceita) {
                console.log(id)
                res.status(422).json({ msg: `Não foi possível encontrar, verifique o Id informado!.` })
            } else if (err) {
                res.status(500).json({ msg: `Erro no servidor tente novamente mais tarde!.`, erro: `${err.message}` })
            } else {
                return res.status(200).json(dbReceita)
            }
        })
    }
    static atualizarDadosReceitaId = (req, res) => {
        // criando variaveis para armazenar o corpo da requisição
        const { descricao, valor, data } = req.body
        const id = req.params.id;
        // verificações para atualização
        Receitas.findById(id, (err, dbReceitaId) => {
            // verificando o corpo da requisição
            if (!dbReceitaId) {
                res.status(500).json({ msg: `Id inexistente!` });
            } else if (err) {
                res.status(500).json({ msg: `Erro de servidor, tente mais tarde!` })
            } else if (!descricao) {
                res.status(422).json({ msg: `Descrição é obrigatório!` });
            } else if (!valor) {
                res.status(422).json({ msg: `Valor é obrigatório!` });
            } else if (!data || (data.length < 10)) {
                res.status(422).json({ msg: `Por favor preencha a data no formato "YYYY-MM-DD"` });
            } else {
                // criando variaveis para data 
                let dbData = Number(dbReceitaId.data.slice(5, 7));
                let dataNew = Number(data.slice(5, 7));
                // Verificando as datas, se a nova data é igual ou maior a do db.
                if (dataNew >= dbData) {
                    // verificar se a descrição é a mesma.
                    if (dbReceitaId.descricao !== descricao) {
                        // verificar se há outra descrição idêntica!.
                        Receitas.findOne({ 'descricao': descricao })
                            .exec((error, dbReceitaOne) => {
                                if (!error) {
                                    if (!dbReceitaOne) {
                                        Receitas.findByIdAndUpdate(id, { $set: req.body })
                                            .exec((err) => {
                                                if (!err) {
                                                    res.status(201).json({ msg: `atualizado por descricão diferente!` })
                                                } else {
                                                    res.status(500).json({ msg: `Erro de servidor, tente mais tarde!` })
                                                }
                                            })
                                    } else {
                                        res.status(422).json({ msg: `Já existe uma descrição com esse nome, porfavor utilize outro!` })
                                    }
                                }
                            })
                    } else { // Se a descrição for a mesma, verificar se não há outra descrição.
                        Receitas.findOne({ 'descricao': descricao })
                            .exec((err, dbReceitaOne) => {
                                let dbDataOne = Number(dbReceitaOne.data.slice(5, 7));
                                if (!err) {
                                    // Verificar se há outro objeto com mesma descrição
                                    if (dbReceitaOne) {
                                        // verificar se é o mesmo id
                                        if (dbReceitaOne.id !== id) {
                                            // se há outra descrição verificar a data
                                            if (dataNew >= dbDataOne) {
                                                // atualizar receita com mesma descrição e data diferente
                                                Receitas.findByIdAndUpdate(id, { $set: req.body })
                                                    .exec((err) => {
                                                        if (!err) {
                                                            res.status(201).json({ msg: `Atualizado com a mesma descrição!` })
                                                        } else {
                                                            res.status(500).json({ msg: `Erro de servidor, tente mais tarde!` })
                                                        }
                                                    })
                                            } else {
                                                res.status(422).json({ msg: `Utilize outra data!` })
                                            }
                                        } else {
                                            Receitas.findByIdAndUpdate(id, { $set: req.body })
                                                .exec((err) => {
                                                    if (!err) {
                                                        res.status(201).json({ msg: `Atualizado com a mesma descrição!` })
                                                    } else {
                                                        res.status(500).json({ msg: `Erro de servidor, tente mais tarde!` })
                                                    }
                                                })
                                        }
                                    } else {
                                        // atualizar receita se acaso não encontrar outra descrição com mesmo nome
                                        Receitas.findByIdAndUpdate(id, { $set: req.body })
                                            .exec((err) => {
                                                if (!err) {
                                                    res.status(201).json({ msg: `Atualizado com a mesma descrição sem verificar Id!` })
                                                } else {
                                                    res.status(500).json({ msg: `Erro de servidor, tente mais tarde!` })
                                                }
                                            })
                                    }
                                } else {
                                    res.status(500).json({ msg: `Erro de servidor, tente mais tarde!` })
                                }
                            })
                    }
                } else {
                    res.status(422).json({ msg: `Data inválida, coloque uma data válida` })
                }
            }
        })
    }
    static deletarReceitaPorId = (req, res) => {
        /* Criando variavel para armarzenar o id da requisição */
        const id = req.params.id;
        /* Verificando se existe o Id passado */
        Receitas.findById(id, (err, dbReceita) => {
            /* Verificando se há erro na requisição */
            if (!err) {
                /* verificando se existe o id solicitado */
                if (dbReceita) {
                    /*  Se existir o id o mesmo é excluido */
                    Receitas.findByIdAndDelete(id, (err) => {
                        if (!err) {
                            res.status(201).json({ msg: `Receita de id: ${id} excluida com sucesso!` })
                        } else {
                            res.status(500).json({ msg: `Erro no servidor, tente novamente mais tarde!` })
                        }
                    })
                } else { // se não existir o id, uma mensagem é exibida
                    res.status(422).json({ msg: `O id informado não existe!` })
                }
            } else {
                res.status(500).json({ msg: `Ocorreu um erro na requisição, Verifique o id informado!` })
            }
        })
    }
}

export default receitasControllers;
