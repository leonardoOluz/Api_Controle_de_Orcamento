import mongoose from "mongoose";

const despesaSchema = mongoose.Schema(
    {
        id: {type: String},
        descricao: {type: String},
        valor: {type: Number},
        data: {type: String}
    }
)

const despesas = mongoose.model('despesas', despesaSchema);
export default despesas;