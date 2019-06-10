import app from './server';

import * as dotenv from 'dotenv';

import { MongoClient } from 'mongodb';
import TimeTrackingDAO from './dao/time-tracking.dao';
import UsersDAO from './dao/users.dao';
import DeviceTokenDAO from './dao/device-token.dao';
import { LogDao } from './dao/log.dao';

const port = process.env.PORT || 8000;

dotenv.config();


MongoClient.connect(
  process.env.CLUSTER_DB,
  // TODO: Connection Pooling
  // Set the poolSize to 50 connections.
  // TODO: Timeouts
  // Set the write timeout limit to 2500 milliseconds.
  { useNewUrlParser: true },
)
  .catch(err => {
    console.error(err.stack);
    process.exit(1);
  })
  .then(async (client: MongoClient) => {
    await UsersDAO.injectDB(client);
    await TimeTrackingDAO.injectDB(client);
    await DeviceTokenDAO.injectDB(client);
    await LogDao.injectDB(client);
    app.listen(port, () => {
      console.log(`listening on port ${port}`);
    });
  });
