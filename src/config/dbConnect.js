import mongoose from "mongoose";
import dotenv from 'dotenv';
dotenv.config();

const dbUser = process.env.DB_USER;
const dbPass = process.env.DB_PASS;

mongoose.connect(`mongodb+srv://${dbUser}:${dbPass}@clusterleoluz.zoaawnu.mongodb.net/API_REST_Controle_de_Orcamento?`);

let db = mongoose.connection;

export default db;