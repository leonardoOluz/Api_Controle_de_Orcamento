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
        Receitas.findOne({ 'descricao': descricao })
            .exec((error, dbDescricao) => {
                if (error) {
                    res.status(500).json({ msg: `${error.message} Erro do servidor, tente novamente mais tarde!` })
                } else if (!descricao) {
                    return res.status(422).json({ msg: `Preencha o campo "Descrição" Campo obrigátorio` })
                } else if (!valor) {
                    return res.status(422).json({ msg: `Preencha o campo "Valor" Campo obrigátorio` })
                } else if (!data) {
                    return res.status(422).json({ msg: `Preencha o campo "Data" Campo obrigátorio` })
                } else {
                    if (dbDescricao) {
                        let dbDataMes = Number(dbDescricao.data.slice(5, 7))
                        let dataMesNew = Number(data.slice(5, 7))
                        if (dataMesNew > dbDataMes) {
                            receitas.save((err) => {
                                if (!err) {
                                    res.status(201).json({ msg: `Receita cadastrada com sucesso! mesmo com descricao.` })
                                } else {
                                    res.status(500).json({ message: `${err.message}` })
                                }
                            })
                        } else {
                            return res.status(422).json({ msg: `A descrição ${descricao} está duplicada no mesmo mês ${dataMesNew}, utilize a descrição já existente para atualizar! ` })
                        }
                    } else {
                        receitas.save((err) => {
                            if (!err) {
                                res.status(201).json({ msg: `Receita cadastrada com sucesso!.` })
                            } else {
                                res.status(500).json({ message: `${err.message}` })
                            }
                        })
                    }
                }
            })
    }
    static listarTodasReceitas = (req, res) => {
        Receitas.find()
        .exec((erro, dbReceitas) => {
            if(!erro){
                res.status(200).json(dbReceitas)
            } else {
                res.status(500).json({msg: `Erro ao conectar ao servidor!. tente novamente mais tarde.`})
            }
        })
    }
}

export default receitasControllers;
