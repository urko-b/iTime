import { Collection, MongoClient } from 'mongodb';
import { LogDao } from './log.dao';

let deviceTokens: Collection<any>;
const collectionName = 'device_tokens';

export default class DeviceTokenDAO {
  public static async injectDB(conn: MongoClient) {
    if (deviceTokens !== undefined) {
      return;
    }
    try {
      deviceTokens = await conn.db().collection(collectionName);
      await LogDao.listenOnChanges(collectionName);
    } catch (e) {
      console.error(`Unable to establish collection handles in DeviceTokenDAO: ${e}`);
    }
  }

  public static async exists(token: string): Promise<boolean> {
    try {
      const tokenFound = await deviceTokens.findOne({ 'token': token });
      if (tokenFound === undefined || tokenFound === null) {
        return false;
      }

      return true;
    } catch (e) {
      console.error(`Unable to establish collection handles in DeviceTokenDAO: ${e}`);
    }
  }

}
