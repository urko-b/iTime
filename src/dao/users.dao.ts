import { MongoClient, Collection } from 'mongodb';
import { LogDao } from './log.dao';

let users: Collection<any>;
const collectionName = 'users';

export default class UsersDAO {
  public static async injectDB(conn: MongoClient) {
    if (users) {
      return;
    }
    try {
      users = await conn.db(process.env.CLUSTER_DB_NS).collection(collectionName);
      await LogDao.listenOnChanges(collectionName);
    } catch (e) {
      console.error(`Unable to establish collection handles in userDAO: ${e}`);
    }
  }



  public static async getUserByEmail(email) {
    try {
      return await users.findOne({ email: email });
    } catch (e) {
      console.log(e);
      return null;
    }
  }


  public static async getUsers() {
    try {
      return await users.find({}, { projection: { email: 1, } }).toArray();
    } catch (e) {
      console.log(e);
      return [];
    }
  }

  public static async getUserByCard(cardId) {
    try {
      const user = await users.findOne({ 'cards': { '$in': [cardId] } });
      return user;
    } catch (e) {
      console.log(e);
      return null;
    }
  }


  public static async addUser(userInfo) {

    try {
      await users.insertOne({ someField: 'someValue' });
      return { success: true };
    } catch (e) {
      if (String(e).startsWith('MongoError: E11000 duplicate key error')) {
        return { error: 'A user with the given email already exists.' };
      }
      console.error(`Error occurred while adding new user, ${e}.`);
      return { error: e };
    }
  }


  public static async loginUser(email) {
    try {
      // await sessions.updateOne(
      //   { email: email },
      //   { $set: { someOtherField: 'someOtherValue' } },
      // );
      return { success: true };
    } catch (e) {
      console.error(`Error occurred while logging in user, ${e}`)
      return { error: e };
    }
  }

  public static async logoutUser(email) {
    try {
      // await sessions.deleteOne({ someField: 'someValue' });
      return { success: true };
    } catch (e) {
      console.error(`Error occurred while logging out user, ${e}`);
      return { error: e };
    }
  }

}
