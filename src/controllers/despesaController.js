import Despesas from '../model/Despesas.js';

class despesasControllers {
    static cadastrarDespesas = (req, res) => {
        /* Criando variaveis para o corpo da requisição */
        const { categoria, descricao, valor, data } = req.body;
        let catInfos;
        /* Verificar se o corpo da requisição está preenchido e data com formato valido */

        if (!categoria) {
            catInfos = 'Outros';
            if (!descricao) {
                res.status(422).json({ msg: `Por favor preencha o campo "descrição".` });
            } else if (!valor) {
                res.status(422).json({ msg: `Por favor preencha o campo "valor"` });
            } else if (!data || (data.length < 10)) {
                res.status(422).json({ msg: `Por favor preencha a data no formato "YYYY-MM-DD"` })
            } else {
                /* .find atualizado */
                Despesas.find({ 'descricao': descricao }, (err, dbDescricao) => {
                    /* Verifica se há erro  */
                    if (!err) {
                        const despesa = new Despesas({ categoria: catInfos, descricao, valor, data });
                        /* Verificar se há outra descrição */
                        if (dbDescricao == '') {
                            /* Se não ouver outra descrição será verificado a data atual */
                            const dataNow = new Date()
                            if (Number(data.slice(5, 7) >= (dataNow.getMonth() + 1))) {
                                /* Se a data atual estiver ok salva nova despesa com descrição nova */
                                despesa.save((err) => {
                                    if (!err) {
                                        res.status(201).json({ msg: `Foi cadastrado com sucesso, sua despesa com a descrição ${descricao} na data de  ${data}` })
                                    } else {
                                        res.status(500).json({ msg: `Erro ao cadastrar, tente novamento mais tarde!` })
                                    }
                                });
                            } else {// se data estiver fora da data atual enviar msg
                                res.status(422).json({ msg: `A data ${data} é inferior a data atual => ${dataNow.getFullYear()}-${dataNow.getMonth() + 1}-${dataNow.getDate()} ` })
                            }
                        } else {
                            /* Função para verificar as datas existentes no banco e comparar */
                            const checking = checkData(data, dbDescricao)
                            /* Ao verificar que a descrição existe no banco de dados, será verifica a data, se não ouver data repetida entrar no if */
                            if (!checking.includes(Number(data.slice(5, 7)))) {
                                /* Apôs verificar a data inexistente verifica-se a data atual ou superior, caso sim criar uma nova despesa*/
                                const dataNow = new Date()
                                if (Number(data.slice(5, 7) >= (dataNow.getMonth() + 1))) {
                                    despesa.save((err) => {
                                        if (!err) {
                                            res.status(201).json({ msg: `Foi cadastrado com sucesso, sua despesa com a descrição ${descricao} na data de  ${data}` })
                                        } else {
                                            res.status(500).json({ msg: `Erro ao cadastrar, tente novamento mais tarde!` })
                                        }
                                    });
                                } else {
                                    res.status(422).json({ msg: `Data inválida, por favor utilize uma data atual ou superior!` })
                                }
                            } else {
                                res.status(422).json({ msg: `Existe uma descrição com nome ${descricao}, a data ${data} está repetida, Utilize outra data!` })
                            }
                        }
                    }
                })
            }
        } else {
            /* Criando array de categoria aceitas */
            catInfos = ['Alimentação', 'Saúde', 'Moradia', 'Transporte', 'Educação', 'Lazer', 'Imprevistos', 'Outros'];
            /* Usando um .includes para verificar se as categorias estão no padrão */
            if (catInfos.includes(categoria)) {
                /* Se as categorias estiverem de acordo com a array catInfos executar  */
                if (!descricao) {
                    res.status(422).json({ msg: `Por favor preencha o campo "descrição".` });
                } else if (!valor) {
                    res.status(422).json({ msg: `Por favor preencha o campo "valor"` });
                } else if (!data || (data.length < 10)) {
                    res.status(422).json({ msg: `Por favor preencha a data no formato "YYYY-MM-DD"` })
                } else {
                    /*  Verificar se existe outra descrição idêntica */
                    Despesas.find({ 'descricao': descricao }, (err, dbDescricao) => {
                        /* Verifica se há erro  */
                        if (!err) {
                            const despesa = new Despesas({ categoria, descricao, valor, data });
                            /* Verificar se há outra descrição */
                            if (dbDescricao == '') {
                                /* Se não ouver outra descrição será verificado a data atual */
                                const dataNow = new Date()
                                if (Number(data.slice(5, 7) >= (dataNow.getMonth() + 1))) {
                                    despesa.save((err) => {
                                        if (!err) {
                                            res.status(201).json({ msg: `Foi cadastrado com sucesso, sua despesa com a descrição ${descricao} na data de  ${data}` })
                                        } else {
                                            res.status(500).json({ msg: `Erro ao cadastrar, tente novamento mais tarde!` })
                                        }
                                    });
                                } else {
                                    res.status(422).json({ msg: `A data ${data} é inferior a data atual => ${dataNow.getFullYear()}-${dataNow.getMonth() + 1}-${dataNow.getDate()} ` })
                                }
                            } else {
                                const checking = checkData(data, dbDescricao)
                                /* Ao verificar que a descrição existe no banco de dados, será verifica a data, se não ouver data repetida entrar no if */
                                if (!checking.includes(Number(data.slice(5, 7)))) {
                                    /* Apôs verificar a data inexistente verifica-se a data atual ou superior, caso sim criar uma nova despesa*/
                                    const dataNow = new Date()
                                    if (Number(data.slice(5, 7) >= (dataNow.getMonth() + 1))) {
                                        despesa.save((err) => {
                                            if (!err) {
                                                res.status(201).json({ msg: `Foi cadastrado com sucesso, sua despesa com a descrição ${descricao} na data de  ${data}` })
                                            } else {
                                                res.status(500).json({ msg: `Erro ao cadastrar, tente novamento mais tarde!` })
                                            }
                                        });
                                    } else {
                                        res.status(422).json({ msg: `Data inválida, por favor utilize uma data atual ou superior!` })
                                    }
                                } else {
                                    res.status(422).json({ msg: `Existe uma descrição com nome ${descricao}, a data ${data} está repetida, Utilize outra data!` })
                                }
                            }
                        }
                    })
                }
            } else { // se não estiver enviar msg de categoria inválida
                res.status(422).json({ msg: `Há categoria ${categoria} é inválida, use a categoria válidas!.` })
            }
        }
        /*Há pôs verificar que a descrição são a mesma, esta função verifica se há alguma data idêntica a data nova.*/
        function checkData(data, dbData) {
            let control = [];
            dbData.forEach((obj) => {
                if (Number(obj.data.slice(5, 7)) === Number(data.slice(5, 7))) {
                    control.push(Number(obj.data.slice(5, 7)))
                }
            })
            return control
        }
    }
    static listarTodasDespesas = (req, res) => {
        const descricao = req.query.descricao
        if (descricao) {
            Despesas.find({ 'descricao': descricao }, (err, dbDescricao) => {
                if (!err) {
                    if (dbDescricao == '') {
                        res.status(200).json({msg: `Não existe despesas para a descrição informada!`})    
                    } else {
                        res.status(200).json(dbDescricao)                            
                    }
                } else {
                    res.status(500).json({ msg: `Não foi possível listar as despesas tente novamente mais tarde!` })
                }
            })

        } else {
            Despesas.find((err, dbDescricao) => {
                if (!err) {
                    if (dbDescricao == '') {
                        res.status(200).json({msg: `Não existe despesas!`})    
                    } else {
                        res.status(200).json(dbDescricao)                            
                    }
                } else {
                    res.status(500).json({ msg: `Não foi possível listar as despesas tente novamente mais tarde!` })
                }
            })
        }
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
                                        if (dataNew >= dbData) {
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
    static deletarDespesaPorId = (req, res) => {
        /* criando variavel para armazenar o Id da requisição */
        const id = req.params.id;
        /* Procurando o ID e deletando */
        Despesas.findByIdAndDelete(id, (err, dbDespesaDelete) => {
            /* Se não tiver erro na digitanção do ID, será verificado a existência do ID*/
            if (!err) {
                /* Se acaso existir o ID uma mensagem de deletado será enviado */
                if (dbDespesaDelete) {
                    res.status(201).json({ msg: `Despesa deletada com sucesso!.` })
                } else { // se não existir o ID uma mensagem de ID inexistente é enviada
                    res.status(422).json({ msg: `O ID solicitado não existe!` })
                }
            } else { // se o ID estiver digitado incorreto, uma mensagem de ID inválido será enviada.
                res.status(422).json({ msg: `Erro, digite um ID válido!` })
            }
        })
    }
    static listarDespesasPorMesAno = (req, res) => {
        /* variaveis da requisição */
        const { ano, mes } = req.query;
        /* .find para puxar o banco de dados */
        Despesas.find()
            .exec((err, dbAnoMes) => {
                if (!err) {
                    /* Verificar as datas do banco de dado e retornar a requisitadas */
                    const checkDbAnoMes = checkingDbAnoMes(dbAnoMes);
                    /* Se não ouver dados no retorno da função checkingDbAnoMes enviar msg de não encontrado*/
                    if(checkDbAnoMes == ''){
                        res.status(422).json({msg: `Não há despesas no mês informado => ${ano}-${mes}`})
                    }else {// se ouver dados enviar.
                        res.status(200).json(checkDbAnoMes)
                    }
                } else {
                    res.status(422).json({ msg: `Erro tente mais tarde!` })
                }
            })

        function checkingDbAnoMes(dbAnoMes) {
            let data
            let checking = [];
            dbAnoMes.forEach((obj) => {
                for (let i = 0; i <= 3; i++) {
                    for (let j = 0; j <= 9; j++) {
                        data = `${ano}-${mes}-${i}${j}`
                        if (data == `${ano}-${mes}-31`) {
                            break
                        } else if (data === obj.data) {
                            checking.push(obj)
                        }
                    }
                }
            })
            return checking;
        }

    }
}

export default despesasControllers;
