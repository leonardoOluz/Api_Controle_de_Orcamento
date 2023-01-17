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
                            res.status(200).json({msg: `Autenticação realizada com sucesso`,token})
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

}

export default usuariosController;
