import usuarios from "../model/Usuario.js";
import bcrypt from 'bcrypt';
import Jwt from "jsonwebtoken";

class usuariosController {
    static cadastrarUsuario = (req, res) => {
        /* Criando variaveis para armazenar a o corpo da requisição */
        const { nome, email, senha, confirSenha } = req.body;
        /* Criando variaveis para armazenar cod bcrypt para criptografia de senha */
        const salt = bcrypt.genSaltSync(10)
        const senhaHash = bcrypt.hashSync(senha, salt)
        /* Criar novo objeto de usuario passando os dados da requisição e o hash de senha gerado */
        const usuario = new usuarios({ nome, email, senha: senhaHash })

        /* Verificar o preenchimento dos dados  */
        if (!nome) {
            res.status(422).json({ msg: `Por favor preencha o nome para cadastro!` })
        } else if (!email) {
            res.status(422).json({ msg: `Por favor preencha o email para cadastro!` })
        } else if (!senha || (senha.length < 8)) {
            res.status(422).json({ msg: `Por favor preencha a senha! obs: A senha deverá conter de 8 a 15 digitos contendo carcteres e numeros` })
        } else if (!confirSenha) {
            res.status(422).json({ msg: `Por favor preencha o campo de confirmar senha!` })
        } else if (senha !== confirSenha) {
            res.status(422).json({ msg: `Senhas não conferem, Por favor confirme sua senha!` })
        } else {
            /* Verificar se existe email cadastrado */
            usuarios.findOne({ 'email': email }, (err, dbEmail) => {
                if (!err) {
                    /*  Verificar se ouver email cadastrado, enviar msg de utilizar outro email ou logar com email existente */
                    if (!dbEmail) {
                        /* Se não ouver email no banco de dados, cadastrar novo usuario */
                        usuario.save((err) => {
                            if (!err) {
                                res.status(200).json({ msg: `Usuario cadastrado com sucesso!` })
                            } else {
                                res.status(422).json({ message: `Erro ao tentar cadastrar, tente novamente mais tarde!` })
                            }
                        })
                    } else {
                        res.status(422).json({ msg: `já existe em nosso banco de dado o cadastro com este email!, utilize outro email! ou se já possui cadastro entre com seu login` })
                    }
                } else {
                    res.status(500).json({ msg: `Erro ao cadastrar tente novamente mais tarde!` })
                }
            })
        }
    }
    static logarUsuarioToken = (req, res) => {
        /* Variaveis para armazenar o corpo da requisição */
        const { email, senha } = req.body;
        /* Verificando se há dados preenchidos */
        if (!email) {
            res.status(422).json({ msg: `Por favor preencha o campo email!` })
        } else if (!senha) {
            res.status(422).json({ msg: `Por favor insira sua senha!` })
        } else {// verificar a existência de email no banco de dados
            usuarios.findOne({ 'email': email }, (err, dbEmail) => {
                if (!err) {
                    if (dbEmail) {// se ouver dados verificar a senha
                        let validacaoSenha = bcrypt.compareSync(senha, dbEmail.senha)
                        if (validacaoSenha) {// se a senha for válida enviar token
                            let secret = process.env.SECRET // usando o Secret do arquvido env
                            let token = Jwt.sign({ id: dbEmail._id, }, secret)// criando um token com jwt
                            res.status(200).json({ msg: `Autenticação realizada com sucesso`, token })
                        } else {
                            res.status(422).json({ msg: `Senhas não conferem, por favor preencha uma senha válida` })
                        }
                    } else {
                        res.status(422).json({ msg: `Por favor preencha um email válida ou cadastre-se!` })
                    }
                } else {
                    res.status(500).json({ msg: `Desculpe, não foi possível continuar com sua solicitação, tente novamente mais tarde! ` })
                }
            })
        }
    }
    static acessarUsuarioPorId = (req, res) => {
        /* Criando variaveis do corpo da requisição */
        const id = req.params.id
        const authHeader = req.headers['authorization']
        const token = authHeader && authHeader.split(' ')[1]
        const secret = process.env.SECRET

        /* Procurando o usuario por id */
        usuarios.findById(id)
            .select('nome email')// usando o select para devolver apenas nome e email do usuario
            .exec((erro, dbId) => {
                if (!erro) {
                    if (dbId) {
                        if (token) {// verificando o token enviado
                            Jwt.verify(token, secret, (err) => {
                                if (!err) {
                                    res.status(200).json(dbId)
                                } else {
                                    res.status(422).json({ msg: `Erro, token inexistente!` })
                                }
                            })
                        } else {
                            res.status(422).json({ msg: `não tem token` })
                        }
                    } else {
                        res.status(422).json({ msg: `não achamos o id` })
                    }

                } else {
                    res.status(422).json({ msg: `erro para verificar o id` })
                }
            })

    }
    static atualizarUsuarioPorId = (req, res) => {
        /* Criando variavies para armazenar corpo da requisição e token do cabeçario */
        const id = req.params.id;
        const { nome, email, senha } = req.body;
        const authHeader = req.headers['authorization']
        const token = authHeader && authHeader.split(' ')[1]
        const secret = process.env.SECRET;
        /* verificando se há token */
        if (token) {
            /* Verificar token válido */
            Jwt.verify(token, secret, (err) => {
                if (err) {// se o token estiver errado enviar mensagem de erro!
                    res.status(422).json({ msg: `Você não tem autorização para acessar o sistema` })
                } else {// se o token for válido verificar campos preenchido
                    if (!nome) {// verificar campo nome
                        res.status(422).json({ msg: `O campo nome é obrigatório!` })
                    } else if (!email) {// verificar campo email
                        res.status(422).json({ msg: `O campo email é obrigatório!` })
                    } else {
                        if (!senha) {// se campo senha não for preenchido atualizar somente nome e email
                            usuarios.findByIdAndUpdate(id, { $set: { nome, email } }, (err, dbUpdate) => {
                                if (!err) {
                                    if (dbUpdate) {
                                        res.status(201).json({ msg: `Usuario atualizado com sucesso!` })
                                    } else {
                                        res.status(422).json({ msg: `Não foi possível atualizar, usuário inexistênte` })
                                    }
                                } else {
                                    res.status(500).json({ msg: `Id não identificado` })
                                }
                            })
                        } else {// senão atualizar nome email e senha convertendo em hash
                            /* Variaveis para armazenar o salt e novo hash */
                            const salt = bcrypt.genSaltSync(10);
                            const senhaHash = bcrypt.hashSync(senha, salt)
                            /*  Buscar usuario do banco por id e atualizar dados */
                            usuarios.findByIdAndUpdate(id, { $set: { nome, email, senha: senhaHash } }, (err, dbUpdate) => {
                                if (!err) {
                                    if (dbUpdate) {
                                        res.status(201).json({ msg: `Usuario atualizado com sucesso!` })
                                    } else {
                                        res.status(422).json({ msg: `Não foi possível atualizar, usuário inexistênte` })
                                    }
                                } else {
                                    res.status(500).json({ msg: `Id não identificado` })
                                }
                            })
                        }
                    }
                }
            })
        } else {
            res.status(422).json({ msg: `Você não tem autorização para acessar o sistema!` })
            /* não atualizar */
        }



    }

}

export default usuariosController;
