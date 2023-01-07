import express from "express";
import db from "./config/dbConnect.js";

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
