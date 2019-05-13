import { Collection, Cursor, MongoClient, ObjectId } from 'mongodb';

let timeTrackings: Collection<any>;

export default class TimeTrackingDAO {
  public static async injectDB(conn: MongoClient) {
    if (timeTrackings) {
      return;
    }
    try {
      timeTrackings = await conn.db(process.env.CLUSTER_DB_NS).collection('time_tracking');
    } catch (e) {
      console.error(`Unable to establish collection handles in userDAO: ${e}`);
    }
  }

  public static async AddTracking(cardId: ObjectId, date: Date) {
    try {
      const tracking: object = { 'card_id': cardId, 'date': date };
      await timeTrackings.insertOne(tracking);

    } catch (e) {
      console.error(`Unable to establish collection handles in userDAO: ${e}`);
    }
  }

  public static async getTrackingsByCard(cardId: string) {
    let cursor: Cursor<any>;
    try {
      cursor = await timeTrackings.find({ 'card_id': new ObjectId(cardId) }).limit(20);
    } catch (e) {
      console.error(`Unable to issue find command, ${e}`);
      return [];
    }

    return cursor.toArray();
  }

}
