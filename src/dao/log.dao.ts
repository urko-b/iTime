
import { Collection, MongoClient, ReplSet } from 'mongodb';
import { Log } from '../model/log';

export class LogDao {
  protected static logs: Collection<any>;
  protected static client: MongoClient;
  protected static listenToChanges: boolean;

  public static async injectDB(connection: MongoClient) {
    this.client = connection;
    if (this.logs !== undefined) {
      return;
    }
    try {
      const db = connection.db(process.env.CLUSTER_DB_NS);
      this.listenToChanges = db.serverConfig instanceof ReplSet;
      this.logs = await db.collection('audit_log');
    } catch (e) {
      console.error(`Unable to establish collection handles in LogDao: ${e}`);
    }
  }

  private static async insertOne(log: Log) {
    try {
      await this.logs.insertOne(log);
    } catch (e) {
      console.error(`insertOne error in LogDao: ${e}`);
    }
  }


  public static async listenOnChanges(collectionName: string) {
    if (!this.listenToChanges) {
      return;
    }
    console.log('listenOnChanges collectionName', collectionName)
    await this.client.db(process.env.CLUSTER_DB_NS)
      .collection(collectionName).watch().on('change', async data => {
        try {
          const log: Log = new Log({
            operation: data.operationType,
            collection_name: collectionName,
            payload: JSON.stringify(data),
            old_value: null,
            new_value: JSON.stringify(data.updateDescription)
          });
          await this.insertOne(log);
        } catch (error) {
          console.error(error);
          throw error;
        }
      });
  }
}
