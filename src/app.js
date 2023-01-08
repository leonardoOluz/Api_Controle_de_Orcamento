/* Importando Lib e Frameworks */
import express from "express";
import db from "./config/dbConnect.js";
import router from "./routers/index.js";

/* Criando variaveis e passando os metodos */
const app = express()
const port = process.env.PORT || 3000;
app.use(express.json())
router(app);


/* Conexão com a porta do servidor e banco de dados */
db.on('error', console.log.bind(console, `Erro de conexão!.`));
db.once('open', ()=> {
    console.log(`Conexão feito com sucesso!.`)
})
app.listen(port, () => {
    console.log(`Porta do servidor escutando em http://localhost:${port}`);
})

export default app;
