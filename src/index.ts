import app from './server';

import * as dotenv from 'dotenv';

import { MongoClient } from 'mongodb';
import UsersDAO from './dao/users.dao';

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
    // await MoviesDAO.injectDB(client)
    await UsersDAO.injectDB(client);
    // await CommentsDAO.injectDB(client)
    app.listen(port, () => {
      console.log(`listening on port ${port}`);
    });
  });


  // mongoose.connect(process.env.DB, { useFindAndModify: false }, connectionError => {
//   if (connectionError) {
//     return console.error(
//       `Error while connecting to database: ${connectionError}`
//     );
//   }

//   const app = new server.App(process.env.PORT);
//   app.init();

//   app.run();
// });
