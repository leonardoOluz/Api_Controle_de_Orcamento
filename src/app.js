/* Importando Lib e Frameworks */
import express from "express";
import db from "./config/dbConnect.js";

/* Conexão com a porta  */
const app = express()
app.use(express.json())
const port = process.env.PORT || 3000;
db.on('error', console.log.bind(console, `Erro de conexão!.`));
db.once('open', ()=> {
    console.log(`Conexão feito com sucesso!.`)
})
app.listen(port, () => {
    console.log(`Porta do servidor escutando em http://localhost:${port}`);
})

export default app;
