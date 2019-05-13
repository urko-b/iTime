import * as bodyParser from 'body-parser';
import cors from 'cors';
import * as express from 'express';
import morgan from 'morgan';
import users from "../src/api/users.route";

const server = express();

server.use(cors());
process.env.NODE_ENV !== "prod" && server.use(morgan("dev"));
server.use(bodyParser.json());
server.use(bodyParser.urlencoded({ extended: true }));

// Register api routes
server.use('/api/v1/user', users);
server.use('/status', express.static('build'));
server.use('/', express.static('build'));
server.use('*', (req, res) => res.status(404).json({ error: 'not found' }));

export default server;
