import usuarios from "../model/Usuario.js";

class usuariosController {
    static cadastrarUsuario = (req, res) => {

        const { nome, email, senha, confirSenha } = req.body;
        const usuario = new usuarios({nome, email, senha})
        
        usuario.save((err) => {
            if (!err) {
                res.status(200).json({ msg: `${nome} ${email} ${senha} ${confirSenha}` })    
            } else {
                res.status(422).json({message: `erro ${err.message}`})
            }           
            
        })

    }
    static buscarUsuario = (req, res) => {
        const {email, senha} = req.body
    }
}

export default usuariosController;
