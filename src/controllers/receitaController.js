import Receitas from '../model/Receitas.js';
import Despesas from '../model/Despesas.js';

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
        /* Se for passado as descrições entra no if para achar somente as descrições passada*/
        if (descricao) {
            Receitas.find({ 'descricao': descricao })
                .exec((erro, dbReceitas) => {
                    if (!erro) {
                        res.status(200).json(dbReceitas)
                    } else {
                        res.status(500).json({ msg: `Erro ao conectar ao servidor!. tente novamente mais tarde.` })
                    }
                })
        } else { // se não pesquisa todas receitas e envia
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
    static listarReceitasPorMesAno = (req, res) => {
        const { ano, mes } = req.query
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
        const { ano, mes } = req.query;
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
                                            const datasVerificadas = checkPorData(dbDespesas)                                           
                                            if (datasVerificadas == '') {
                                                res.status(422).json({ msg: `Não há informações na data solicitada!` })
                                            } else {
                                                /* Filtrar os dados para somar gastos total de despesas e por categoria */
                                                const totGastosMes = checkPorValores(datasVerificadas, dbReceitas);
                                                res.status(200).json(totGastosMes)
                                            }
                                        }
                                        /* criar codigo para resumo de despesas aqui*** */
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
                                            // const datasVerificadasReceitas = checkPorData(dbReceitas)
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
        function checkPorData(dataBase) {
            /* VAriaveis para controlar data e receber os objs do banco de dados */
            let result = [];
            let data;
            /* Usando dois for para que possa verificar toda a data do mês */
            for (let a = 0; a <= 3; a++) {
                for (let b = 0; b <= 9; b++) {
                    data = `${ano}-${mes}-${a}${b}`
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
