import * as bodyParser from 'body-parser';
import * as cors from 'cors';
import * as express from 'express';
import * as morgan from 'morgan';
import users from '../src/api/users.route';
import AuthController from './api/controllers/auth.controller';
import timetracking from './api/time-tracking.route';
import workedHours from './api/worked-hours.route';

import * as http from 'http';
import * as socketIO from 'socket.io';

const app = express();

app.use(cors());
process.env.NODE_ENV !== 'prod' && app.use(morgan('dev'));

//Set SocketIO
const server = http.createServer(app);
const io = socketIO(server);
app.set('io', io);


//Middlewares
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(AuthController.authMiddleware);

// Register api routes
app.use('/api/v1/user', users);
app.use('/api/v1/timeTracking', timetracking);
app.use('/api/v1/workedHours', workedHours);

// server.use('/status', express.static('build'));
// server.use('/', express.static('build'));

app.use('*', (req, res) => res.status(404).json({ error: 'not found' }));


server.listen(process.env.SOCKET_PORT, () => {
  console.log(`Listening on port ${process.env.SOCKET_PORT}`);
});

export default app;
