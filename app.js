import express from 'express';
import { fileURLToPath } from 'url';
import path from 'path';
import cors from 'cors';
//import passport from 'passport';
import apiRoutes from './src/routes/api.js';
import bodyParser from 'body-parser';

const server = express();

const corsOptions = {
    origin: "*",
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true, // Habilita o compartilhamento de cookies ou autenticação
    optionsSuccessStatus: 204, // Responder com um código de status 204 para opções pré-voo
  };

server.use(cors(corsOptions));

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

server.use(express.static(path.join(__dirname, '/public')));
server.use(bodyParser.json())
server.use(express.urlencoded({ extended: true }));

//server.use(passport.initialize());

server.use('/api', apiRoutes);

server.use((req, res) => {
    res.status(404);
    res.json({ error: 'Endpoint não encontrado.' });
});

const errorHandler = (err, req, res, next) => {
    if(err.status) {
        res.status(err.status);
    } else {
        res.status(400); //Bad Request 
    }
    if(err.message) {
        res.json({ error: err.message });
    } else {
        res.json({ error: 'Ocorreu algum erro.'})
    }
}
server.use(errorHandler);

server.listen(process.env.PORT, ()=> {
    console.log(`Server is running on port ${process.env.PORT}`);
});