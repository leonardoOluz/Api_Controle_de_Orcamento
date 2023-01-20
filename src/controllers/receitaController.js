import Receitas from '../model/Receitas.js';
import Despesas from '../model/Despesas.js';
import Jwt from 'jsonwebtoken';

class receitasControllers {

    static cadastrarReceitas = (req, res) => {
        const { descricao, valor, data } = req.body;
        const authHeader = req.headers['authorization']
        const token = authHeader && authHeader.split(' ')[1]
        const secret = process.env.SECRET
        const receitas = new Receitas(
            {
                descricao,
                valor,
                data
            }
        )
        /* Verificar autorização d token */
        if (token) {
            Jwt.verify(token, secret, (err) => {
                if (!err) {
                    if (!descricao) {
                        return res.status(422).json({ msg: `Preencha o campo Descrição Campo obrigátorio` })
                    } else if (!valor) {
                        return res.status(422).json({ msg: `Preencha o campo Valor Campo obrigátorio` })
                    } else if (!data || (data.length < 10)) {
                        return res.status(422).json({ msg: `Por favor preencha a data no formato YYYY-MM-DD` })
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
                } else {
                    res.status(422).json({ msg: `Você não tem permissões para acessar o sistema!` })
                }
            })
        } else {
            res.status(422).json({ msg: `Você não tem permissões para acessar o sistema!` })
        }
        function checkData(data, dbDat) {
            let control = [];
            dbDat.forEach((obj) => {

                if (Number(data.slice(5, 7)) === Number(obj.data.slice(5, 7))) {
                    control.push(Number(obj.data.slice(5, 7)))
                }

            })
            return control;
        }
    }
    static listarTodasReceitas = (req, res) => {
        const descricao = req.query.descricao
        const authHeader = req.headers['authorization']
        const token = authHeader && authHeader.split(' ')[1]
        const secret = process.env.SECRET
        /* Verificando token de autenticação */
        if (token) {
            /*  Validando token */
            Jwt.verify(token, secret, (err) => {
                if (!err) {
                    /* Se for passado as descrições entra no if para achar somente as descrições passada*/
                    if (descricao) {
                        Receitas.find({ 'descricao': descricao })
                            .exec((erro, dbReceitas) => {
                                if (!erro) {
                                    if (dbReceitas == '') {
                                        res.status(200).json({ msg: `Não existe receitas para a descrição informada!` })
                                    } else {
                                        res.status(200).json(dbReceitas)
                                    }
                                } else {
                                    res.status(500).json({ msg: `Erro ao conectar ao servidor!. tente novamente mais tarde.` })
                                }
                            })
                    } else { // se não há descrição pesquisar todas receitas e enviar
                        Receitas.find()
                            .exec((erro, dbReceitas) => {
                                if (!erro) {
                                    if (dbReceitas == '') {
                                        res.status(200).json({ msg: `Não existe receitas!` })
                                    } else {
                                        res.status(200).json(dbReceitas)
                                    }
                                } else {
                                    res.status(500).json({ msg: `Erro ao conectar ao servidor!. tente novamente mais tarde.` })
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
    static detalhesReceitaId = (req, res) => {
        const id = req.params.id;
        const authHeader = req.headers['authorization']
        const token = authHeader && authHeader.split(' ')[1]
        const secret = process.env.SECRET
        /* verificando token */
        if (token) {
            /* Validando token */
            Jwt.verify(token, secret, (err) => {
                if (!err) {
                    Receitas.findById(id, (err, dbReceita) => {
                        if (!dbReceita) {
                            res.status(422).json({ msg: `Não foi possível encontrar, verifique o Id informado!.` })
                        } else if (err) {
                            res.status(500).json({ msg: `Erro no servidor tente novamente mais tarde!.`, erro: `${err.message}` })
                        } else {
                            return res.status(200).json(dbReceita)
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
    static atualizarDadosReceitaId = (req, res) => {
        // criando variaveis para armazenar o corpo da requisição
        const { descricao, valor, data } = req.body
        const id = req.params.id;
        const authHeader = req.headers['authorization']
        const token = authHeader && authHeader.split(' ')[1]
        const secret = process.env.SECRET
        /* Verificar token */
        if (token) {
            /* Válidar token */
            Jwt.verify(token, secret, (err) => {
                if (!err) {
                    if (!descricao) {
                        res.status(422).json({ mensagem: `Descrição é obrigatório!` })
                    } else if (!valor) {
                        res.status(422).json({ mensagem: `Valor é obrigatório!` })
                    } else if (!data || (data.length < 10)) {
                        res.status(422).json({ msg: `Por favor preencha a data no formato YYYY-MM-DD` })
                    } else {
                        /* Verificando a existência do ID */
                        Receitas.findById(id, (err, dbReceitaId) => {
                            if (!err) {
                                if (dbReceitaId) {
                                    /* Se existir o ID verificar a data nova com a data do banco */
                                    const dbData = Number(dbReceitaId.data.slice(5, 7))
                                    const dataNew = Number(data.slice(5, 7))
                                    /*  verificar se a data nova é igual ou superior a data da receita existente */
                                    if (dataNew >= dbData) {
                                        /* Verificar no banco a existência de mesma descrição*/
                                        Receitas.find({ 'descricao': descricao }, (err, dbDescricaoReceita) => {
                                            if (!err) {
                                                /* Verificar existência de dados com mesma descrição no banco */
                                                if (dbDescricaoReceita) {
                                                    /* verificar as datas com mesma descrição */
                                                    const dataChecada = checkData(dbDescricaoReceita)
                                                    /* Se retornar vazio o datachecada não existe datas repetidas e pode atualizar */
                                                    if (dataChecada == '') {
                                                        Receitas.findByIdAndUpdate(id, { $set: req.body }, (err) => {
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
                                                    Receitas.findByIdAndUpdate(id, { $set: req.body }, (err) => {
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
    static deletarReceitaPorId = (req, res) => {
        /* Criando variavel para armarzenar o id da requisição */
        const id = req.params.id;
        const authHeader = req.headers['authorization']
        const token = authHeader && authHeader.split(' ')[1]
        const secret = process.env.SECRET
        /* Verificar token */
        if (token) {
            /* Validar token*/
            Jwt.verify(token, secret, (err) => {
                if (!err) {
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
                } else {
                    res.status(422).json({ msg: `Você não tem permissões para acessar o sistema!` })
                }
            })
        } else {
            res.status(422).json({ msg: `Você não tem permissões para acessar o sistema!` })
        }
    }
    static listarReceitasPorMesAno = (req, res) => {
        const { ano, mes } = req.params
        const authHeader = req.headers['authorization']
        const token = authHeader && authHeader.split(' ')[1]
        const secret = process.env.SECRET
        /* Verificando token */
        if (token) {
            /* Valindado token */
            Jwt.verify(token, secret, (err) => {
                if (!err) {
                    Receitas.find()
                        .exec((err, dbReceitas) => {
                            if (!err) {
                                const resultDbData = checkData(dbReceitas);
                                if (resultDbData == '') {
                                    res.status(422).json({ msg: `Não há receitas nesta data ${ano}-${mes}` })
                                } else {
                                    res.status(200).json(resultDbData)
                                }
                                // 
                            } else {
                                res.status(422).json({ msg: `erro` })
                            }
                        })
                } else {
                    res.status(422).json({ msg: `Você não tem permissões para acessar o sistema!` })
                }
            })
        } else {
            res.status(422).json({ msg: `Você não tem permissões para acessar o sistema!` })
        }
        function checkData(dbReceitas) {
            /* Variaveis para controlar e armazenar resultados */
            let data;
            let checkDbdata = [];
            /* Usando o forEach para verificar dentro de cada obj a data */
            dbReceitas.forEach((obj) => {
                for (let i = 0; i <= 3; i++) {
                    for (let j = 0; j <= 9; j++) {
                        data = `${ano}-${mes}-${i}${j}`
                        if (data === `${ano}-${mes}-32`) {
                            break
                        } else if (data === `${ano}-${mes}-00`) {
                            continue;
                        } else {
                            if (obj.data === data) {
                                checkDbdata.push(obj)
                            } else {
                                continue;
                            }
                        }
                    }
                }
            })
            return checkDbdata;
        }
    }
    static resumoDoMes = (req, res) => {
        const { anoNumber, mesNumber } = req.params;
        const authHeader = req.headers['authorization']
        const token = authHeader && authHeader.split(' ')[1]
        const secret = process.env.SECRET

        /* Verificar token */
        if (token) {
            /* Validar token */
            Jwt.verify(token, secret, (err) => {
                if (!err) {
                    /* Puxando informações do banco de dados! */
                    Receitas.find()
                        .exec((err, dbReceitas) => {
                            if (!err) {
                                /* Verificando se tem informações de receitas no banco */
                                if (dbReceitas == '') {// se acaso não tiver receita, verificar se há despesas.
                                    Despesas.find()
                                        .exec((err, dbDespesas) => {
                                            if (!err) {
                                                /* Verificar se tem informações de despesas no banco */
                                                if (dbDespesas == '') {// se acaso não ouver informações de despesas, enviar mensagem de que não há dados no banco de receita e despesas.
                                                    res.status(422).json({ msg: `Não é possivel detalhar as informações por não existir dados de receita e depesas` })
                                                } else {// se ouver dados de Despesas, verificar a data e mês para resumir valores total da despesas do mes e total de cada categoria
                                                    /* Filtrar todos os dados por data informada */
                                                    const datasVerificadas = checkPorData(dbDespesas)
                                                    if (datasVerificadas == '') {
                                                        res.status(422).json({ msg: `Não há informações na data solicitada!` })
                                                    } else {
                                                        /* Filtrar os dados para somar gastos total de despesas e por categoria */
                                                        const totGastosMes = checkPorValores(datasVerificadas, dbReceitas);
                                                        res.status(200).json(totGastosMes)
                                                    }
                                                }
                                            } else {// se ouver erro na pesquisa de banco de dados
                                                res.status(500).json({ msg: `Erro, tente novamente mais tarde!` })
                                            }
                                        })
                                } else {// Se ouver receitas verificar se há despesas
                                    Despesas.find()
                                        .exec((err, dbDespesas) => {
                                            if (!err) {
                                                /* Verificar se tem informações de despesas no banco */
                                                if (dbDespesas == '') {// se acaso não ouver informações de despesas, enviar apenas dados de receita
                                                    /* criar codigo aqui *** */
                                                    const datasVerificadas = checkPorData(dbReceitas)
                                                    if (datasVerificadas == '') {
                                                        res.status(422).json({ msg: `Não há informações na data solicitada!` })
                                                    } else {
                                                        /* Filtrar os dados para somar gastos total de despesas e por categoria */
                                                        const totGastosMes = checkPorValores(dbDespesas, datasVerificadas);
                                                        res.status(200).json(totGastosMes)
                                                    }
                                                } else {// Se ouver dados filtrar total de despesas, total de receitas, saldo final e total gasto no mês por categoria
                                                    const datasVerificadas = checkPorData(dbDespesas)
                                                    const datasVerificadasReceitas = checkPorData(dbReceitas)
                                                    if ((datasVerificadas == '') && (datasVerificadasReceitas == '')) {
                                                        res.status(422).json({ msg: `Não há informações na data solicitada!` })
                                                    } else {
                                                        /* Filtrar os dados para somar gastos total de despesas e por categoria */
                                                        const totGastosMes = checkPorValores(datasVerificadas, datasVerificadasReceitas);
                                                        res.status(200).json(totGastosMes)
                                                    }
                                                }
                                            } else {// se ouver erro na pesquisa de banco de dados
                                                res.status(500).json({ msg: `Erro, tente novamente mais tarde!` })
                                            }
                                        })
                                }
                            } else {// se ouver erro na pesquisa de banco de dados 
                                res.status(500).json({ msg: `Erro, tente novamente mais tarde!` })
                            }
                        })
                } else {
                    res.status(422).json({ msg: `Você não tem permissões para acessar o sistema!` });
                }
            })
        } else {
            res.status(422).json({ msg: `Você não tem permissões para acessar o sistema!` })
        }




        function checkPorData(dataBase) {
            /* VAriaveis para controlar data e receber os objs do banco de dados */
            let result = [];
            let data;
            /* Usando dois for para que possa verificar toda a data do mês */
            for (let a = 0; a <= 3; a++) {
                for (let b = 0; b <= 9; b++) {
                    data = `${anoNumber}-${mesNumber}-${a}${b}`
                    /* Usando forEach para percorrer todo obj do dbDespesas/dbReceitas */
                    dataBase.forEach((obj) => {
                        if (data === obj.data) {
                            result.push(obj)
                        }
                    })
                }
            }
            return result;
        }
        function checkPorValores(dbDespesas, dbReceitas) {
            /* VAriaveis de controle */
            let totGastosMesDespesas = 0;
            let totGastosMesReceitas = 0;
            let totGastosCategoria = 0;
            let retornCat = [];
            let catInfos = ['Alimentação', 'Saúde', 'Moradia', 'Transporte', 'Educação', 'Lazer', 'Imprevistos', 'Outros'];

            /* ForEach para somar os valores das Despesas e Receitas */
            dbReceitas.forEach((receita) => {
                totGastosMesReceitas += receita.valor;
            })
            dbDespesas.forEach((depesa) => {
                totGastosMesDespesas += depesa.valor;
            })

            retornCat.push({ [`Valor total das receitas no mês`]: totGastosMesReceitas })
            retornCat.push({ [`Valor total das despesas no mês`]: totGastosMesDespesas })
            retornCat.push({ [`Saldo final no mês`]: (totGastosMesReceitas - totGastosMesDespesas) })
            /* For para verificar as categorias e somar os valores das idênticas */
            for (let i in catInfos) {
                /* Usando o forEach */
                dbDespesas.forEach((despesas) => {
                    if (despesas.categoria === catInfos[i]) {
                        totGastosCategoria += despesas.valor
                    }
                })
                if (totGastosCategoria !== 0) {// se o totGastosCategoria estiver com valores será puxado pelo retornCat.push.
                    retornCat.push({ [catInfos[i]]: totGastosCategoria });
                    totGastosCategoria = 0;
                }
            }

            return retornCat
        }

    }
}

export default receitasControllers;
