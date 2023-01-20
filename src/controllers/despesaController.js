import Despesas from '../model/Despesas.js';
import jwt from 'jsonwebtoken';

class despesasControllers {
    static cadastrarDespesas = (req, res) => {
        /* Criando variaveis para o corpo da requisição */
        const { categoria, descricao, valor, data } = req.body;
        const authHeader = req.headers['authorization']
        const token = authHeader && authHeader.split(' ')[1]
        const secret = process.env.SECRET
        let catInfos;

        /* Verificar token */
        if (token) {
            /* Validar token */
            jwt.verify(token, secret, (err) => {
                if (!err) {
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
                } else {
                    res.status(422).json({ msg: `Você não tem permissões para acessar o sistema!` })
                }
            })
        } else {
            res.status(422).json({ msg: `Você não tem permissões para acessar o sistema!` })
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
        const descricao = req.query.descricao;
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];
        const secret = process.env.SECRET;
        /* Verificar token */
        if (token) {
            /* Validar token */
            jwt.verify(token, secret, (err) => {
                if (!err) {
                    if (descricao) {
                        Despesas.find({ 'descricao': descricao }, (err, dbDescricao) => {
                            if (!err) {
                                if (dbDescricao == '') {
                                    res.status(200).json({ msg: `Não existe despesas para a descrição informada!` })
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
                                    res.status(200).json({ msg: `Não existe despesas!` })
                                } else {
                                    res.status(200).json(dbDescricao)
                                }
                            } else {
                                res.status(500).json({ msg: `Não foi possível listar as despesas tente novamente mais tarde!` })
                            }
                        })
                    }



                } else {
                    res.status(422).json({ msg: `Você não tem permissões para acessar o sistema!` })
                }
            })
        } else {
            res.status(422).json({ msg: `Você não tem permissões para acessar o sistema!` })
        }
    }
    static detalharDespesaPorId = (req, res) => {
        /* Criando variavel id para armazenar os paramentros da requisição */
        const id = req.params.id;
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];
        const secret = process.env.SECRET;
        /* Verificar token */
        if (token) {
            /* validar token */
            jwt.verify(token, secret, (err) => {
                if (!err) {
                    /*  Verificando no banco a existência do id */
                    Despesas.findById(id, (err, dbDespesa) => {
                        if (!err) {
                            if (dbDespesa) {
                                /*  Se acaso existir o mesmo é enviado em formado json*/
                                res.status(200).json(dbDespesa);
                            } else { // se não ouver os dados é enviado uma msg informando a inexistência do dado
                                res.status(422).json({ msg: `Não foi possível identificar o id: ${id}, O mesmo pode não existir no banco de dados! ` })
                            }
                        } else {
                            res.status(422).json({ mensagem: `Erro, verifique o Id` })
                        }
                    })
                } else {
                    res.status(422).json({ msg: `Você não tem permissões para acessar o sistema!` })
                }
            })
        } else {
            res.status(422).json({ msg: `Você não tem permissões para acessar o sistema!` })
        }
    }
    static atualizarDespesaPorId = (req, res) => {
        /* Criando variaveis para os parâmentros */
        const { descricao, valor, data } = req.body;
        const id = req.params.id;
        const authHeader = req.headers['authorization']
        const token = authHeader && authHeader.split(' ')[1]
        const secret = process.env.SECRET

         /* Verificar token */
         if (token) {
            /* Válidar token */
            jwt.verify(token, secret, (err) => {
                if (!err) {
                    if (!descricao) {
                        res.status(422).json({ mensagem: `Descrição é obrigatório!` })
                    } else if (!valor) {
                        res.status(422).json({ mensagem: `Valor é obrigatório!` })
                    } else if (!data || (data.length < 10)) {
                        res.status(422).json({ msg: `Por favor preencha a data no formato YYYY-MM-DD` })
                    } else {
                        /* Verificando a existência do ID */
                        Despesas.findById(id, (err, dbDespesad) => {
                            if (!err) {
                                if (dbDespesad) {
                                    /* Se existir o ID verificar a data nova com a data do banco */
                                    const dbData = Number(dbDespesad.data.slice(5, 7))
                                    const dataNew = Number(data.slice(5, 7))
                                    /*  verificar se a data nova é igual ou superior a data da Despesas existente */
                                    if (dataNew >= dbData) {
                                        /* Verificar no banco a existência de mesma descrição*/
                                        Despesas.find({ 'descricao': descricao }, (err, dbDescricaoDespesas) => {
                                            if (!err) {
                                                /* Verificar existência de dados com mesma descrição no banco */
                                                if (dbDescricaoDespesas) {
                                                    /* verificar as datas com mesma descrição */
                                                    const dataChecada = checkData(dbDescricaoDespesas)
                                                    /* Se retornar vazio o datachecada não existe datas repetidas e pode atualizar */
                                                    if (dataChecada == '') {
                                                        Despesas.findByIdAndUpdate(id, { $set: req.body }, (err) => {
                                                            if (!err) {
                                                                res.status(201).json({ msg: `Dados atualizado com  sucesso` })
                                                            } else {
                                                                res.status(422).json({ msg: `Erro para atualizar, verifique o ID` })
                                                            }
                                                        })
                                                    } else {
                                                        res.status(422).json({ mensagem: `Não é possível atualizar os dados com esta data, Descrição com data existente` })
                                                    }
                                                } else {
                                                    /* Aqui atualizar dados sem necessidade  de verificar pois não existe outras descrições*/
                                                    Despesas.findByIdAndUpdate(id, { $set: req.body }, (err) => {
                                                        if (!err) {
                                                            res.status(201).json({ msg: `Dados atualizado com  sucesso` })
                                                        } else {
                                                            res.status(422).json({ msg: `Erro para atualizar, verifique o ID` })
                                                        }
                                                    })
                                                }
                                            } else {
                                                res.status(422).json({ mensagem: `Não foi possìvel identificar a descrição` })
                                            }
                                        })
                                    } else {
                                        res.status(422).json({ mensagem: `Não é possível atualizar com data anterior, verifique e atualize a data!` })
                                    }
                                } else {
                                    res.status(422).json({ msg: `Não existe dados no banco com este ID ${id}!` })
                                }
                            } else {
                                res.status(500).json({ msg: `Erro verifique o Id !` })
                            }
                        })
                    }
                } else {
                    res.status(422).json({ msg: `Você não tem permissões para acessar o sistema!` })
                }
            })
        } else {
            res.status(422).json({ msg: `Você não tem permissões para acessar o sistema!` })
        }
        /* Função de verificação de datas */
        function checkData(dbDat) {
            let control = [];
            dbDat.forEach((obj) => {
                if ((`${obj._id}` !== `${id}`) && (Number(data.slice(5, 7)) === Number(obj.data.slice(5, 7)))) {
                    control.push(Number(obj.data.slice(5, 7)))
                }
            })
            return control;
        }

    }
    static deletarDespesaPorId = (req, res) => {
        /* criando variavel para armazenar o Id da requisição */
        const id = req.params.id;
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];
        const secret = process.env.SECRET;
        /* Verificando token */
        if (token) {
            /* Validar token */
            jwt.verify(token, secret, (err) => {
                if (!err) {
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
                } else {
                    res.status(422).json({ msg: `Você não tem permissões para acessar o sistema!` })
                }
            })
        } else {
            res.status(422).json({ msg: `Você não tem permissões para acessar o sistema!` })
        }
    }
    static listarDespesasPorMesAno = (req, res) => {
        /* variaveis da requisição */
        const { ano, mes } = req.params;
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1]
        const secret = process.env.SECRET;
        /* Verificar token */
        if (token) {
            /* Validar token */
            jwt.verify(token, secret, (err) => {
                if (!err) {
                    /* .find para puxar o banco de dados */
                    Despesas.find()
                        .exec((err, dbAnoMes) => {
                            if (!err) {
                                /* Verificar as datas do banco de dado e retornar a requisitadas */
                                const checkDbAnoMes = checkingDbAnoMes(dbAnoMes);
                                /* Se não ouver dados no retorno da função checkingDbAnoMes enviar msg de não encontrado*/
                                if (checkDbAnoMes == '') {
                                    res.status(422).json({ msg: `Não há despesas no mês informado => ${ano}-${mes}` })
                                } else {// se ouver dados enviar.
                                    res.status(200).json(checkDbAnoMes)
                                }
                            } else {
                                res.status(422).json({ msg: `Erro tente mais tarde!` })
                            }
                        })
                } else {
                    res.status(422).json({ msg: `Você não tem permissões para acessar o sistema!` })
                }
            })
        } else {
            res.status(422).json({ msg: `Você não tem permissões para acessar o sistema!` })
        }
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
