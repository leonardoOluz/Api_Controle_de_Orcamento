import mongoose from "mongoose";

const usuarioSchema = mongoose.Schema(
    {
        id: {type: String},
        nome: {type: String, require: true},
        email: {type: String, require: true},
        senha: {type: String, require: true},
        receitas: [{type: mongoose.SchemaTypes.ObjectId, Ref: 'receitas'},],
        despesas: [{type: mongoose.SchemaTypes.ObjectId, ref: 'despesas'},]
    }
)

const usuarios = mongoose.model('usuarios', usuarioSchema);
export default usuarios
