import { Collection, Cursor, MongoClient, ObjectId, AggregationCursor } from 'mongodb';
import UsersDAO from './users.dao';
import { LogDao } from './log.dao';
import moment = require('moment');
import * as  momentDurationFormatSetup from 'moment-duration-format';
momentDurationFormatSetup(moment);

let timeTrackings: Collection<any>;
const collectionName = 'time_tracking';

export default class TimeTrackingDAO {
  public static async injectDB(conn: MongoClient) {
    if (timeTrackings !== undefined) {
      return;
    }
    try {
      timeTrackings = await conn.db(process.env.CLUSTER_DB_NS).collection(collectionName);
      await LogDao.listenOnChanges(collectionName);
    } catch (e) {
      console.error(`Unable to establish collection handles in TimeTrackingDAO: ${e}`);
    }
  }

  public static async addTracking({ email = null, cardId = null, date = null, position = null }) {
    try {
      const user = await TimeTrackingDAO.getUserByEmail(email, cardId);
      if (user == null || user === undefined) {
        return;
      }

      const previousTrack = await TimeTrackingDAO.getPreviousTracking({ cardId: user.cards[0], userId: user._id });
      let isWorking = true;
      if (previousTrack !== undefined && previousTrack !== null) {
        isWorking = !previousTrack['is_working'];
      }

      date = date != null || undefined ? date : new Date(Date.now()).toISOString();

      const tracking: object = {
        'user_id': user._id,
        'card_id': user.cards !== undefined ? user.cards[0] : null,
        date,
        position,
        'is_working': isWorking
      };
      await timeTrackings.insertOne(tracking);

      return isWorking;
    } catch (e) {
      console.error(`TimeTrackingDAO AddTracking: ${e}`);
    }
  }


  public static async isWorking({ email = null, cardId = null }) {
    try {
      let isWorking = false;
      const user = await TimeTrackingDAO.getUserByEmail(email, cardId);
      const previousTracking = await TimeTrackingDAO.getPreviousTracking({ cardId: user.cards[0], userId: user._id });
      if (previousTracking !== undefined && previousTracking !== null) {
        isWorking = previousTracking['is_working'];
      }

      return isWorking;
    } catch (e) {
      console.error(`TimeTrackingDAO isWorking ${e}`);
      return false;
    }
  }

  private static async getPreviousTracking({ cardId = null, userId = null }) {
    try {
      const today = new Date(Date.now());

      const filter = {
        'date': {
          '$gte': new Date(today.setUTCHours(0, 0, 0, 1)).toISOString(),
          '$lte': new Date(today.setUTCHours(23, 59, 59, 0)).toISOString()
        }
      };

      if (cardId !== null) {
        filter['card_id'] = cardId;
      }

      if (userId !== null) {
        filter['user_id'] = userId;
      }

      const cursor: Cursor<any> = await timeTrackings.find(filter)
        .sort({ date: -1 })
        .limit(1);
      const previousTrack = await cursor.next();
      return previousTrack;
    } catch (e) {
      console.error(`TimeTrackingDAO getPreviousTracking ${e}`);
      return null;
    }
  }

  public static async getTrackings({ email = null, rows = 10, page = 0 }) {
    let cursor: AggregationCursor<any>;
    try {
      const user = await UsersDAO.getUserByEmail(email);


      const aggregate: any[] = [
        {
          '$lookup': {
            'from': 'users',
            'localField': 'user_id',
            'foreignField': '_id',
            'as': 'user'
          }
        }, {
          '$project': {
            'fullName': 1,
            'date': 1,
            'is_working': 1,
            'position': 1,
            'roles': 1,
            'user': {
              '$arrayElemAt': [
                '$user', 0
              ]
            }
          }
        }
      ];

      if (!user.roles.some(rol => rol === 'show_history_everyone')) {
        aggregate.unshift({
          '$match': {
            'user_id': new ObjectId(user._id)
          }
        });
      }
      cursor = await timeTrackings.aggregate(aggregate); //.skip(page * rows).limit(rows);
    } catch (e) {
      console.error(`TimeTrackingDAO getTrackings ${e}`);
      return [];
    }

    return cursor.toArray();
  }

  public static async getTrackingsByUserAndDate({ cardId = null, email = null, from = Date.now(), to = Date.now() }) {
    let cursor: Cursor<any>;
    try {

      const user = await TimeTrackingDAO.getUserByEmail(email, cardId);
      const user_id = user._id;

      const fromDate = new Date(from);
      const toDate = new Date(to);
      const filter = {
        'date': {
          '$gte': new Date(fromDate.setUTCHours(0, 0, 0, 1)).toISOString(),
          '$lte': new Date(toDate.setUTCHours(23, 59, 59, 0)).toISOString()
        },
        '$or': [{ 'card_id': { '$in': [user.cards] } }, { 'user_id': new ObjectId(user_id) }]
      };
      console.log('getTrackingsByUserAndDate filter ', filter);
      cursor = await timeTrackings.find(filter);
      return cursor.toArray();
    } catch (e) {
      console.error(`TimeTrackingDAO getTrackingsByUserAndDate ${e}`);
      return [];
    }
  }

  private static async getUserByEmail(email: any, cardId: any) {
    try {
      const user =
        (email !== null && email !== undefined) ?
          await UsersDAO.getUserByEmail(email) :
          await UsersDAO.getUserByCard(cardId);

      if (user.cards === undefined) {
        user.cards = [];
      }

      return user;
    } catch (e) {
      console.error(`TimeTrackingDAO getUserByEmail ${e}`);
      return null;
    }
  }


  public static async getFromToBagOfHoursWorked({ cardId = null, email = null, from = Date.now(), to = null }) {
    try {
      const trackings = await TimeTrackingDAO.getTrackingsByUserAndDate({ cardId, email, from, to });
      const bagOfHoursWorked = TimeTrackingDAO.getBagOfHoursWorked(trackings);
      return bagOfHoursWorked;
    } catch (e) {
      console.error(`TimeTrackingDAO getFromToBagOfHoursWorked ${e}`);
      return [];
    }
  }

  public static async getSumFromToBagOfHoursWorked({ cardId = null, email = null, from = Date.now(), to = null }) {
    try {
      const bagOfHoursWorked = await TimeTrackingDAO.getFromToBagOfHoursWorked({ cardId, email, from, to });
      const sum = bagOfHoursWorked
        .map((value, index) => value.workingTime)
        .slice(1).reduce(
          (previous, current, index) => {
            return moment.duration(current).add(moment.duration(previous));
          },
          moment.duration(bagOfHoursWorked[0]));
      console.log('sum', (moment.duration(sum.asSeconds(), 'seconds') as any).format('hh:mm:ss'));
      return (moment.duration(sum.asSeconds(), 'seconds') as any).format('hh:mm:ss');
    } catch (e) {
      console.error(`TimeTrackingDAO getSumFromToBagOfHoursWorked ${e}`);
      return '00:00:00';
    }
  }



  private static getBagOfHoursWorked(trackings: any[]) {
    let previous: any;
    let bagOfHoursWorked = [];
    console.log('getBagOfHoursWorked trackings', trackings)
    for (let i = 0; i < trackings.length; i++) {
      const element = trackings[i];
      if (previous) {
        if (i % 2 !== 0) {
          const previousDate = moment(new Date(previous.date), 'DD/MM/YYYY HH:mm:ss');
          const currentDate = moment(new Date(element.date), 'DD/MM/YYYY HH:mm:ss');
          const workingTime = moment.utc(currentDate.diff(previousDate)).format('HH:mm:ss');
          bagOfHoursWorked.push({ work: previousDate, break: currentDate, workingTime });
        }
      }
      previous = element;
    }
    return bagOfHoursWorked;
  }

  // private aggregateSwitch() {

  //   const aggregate = [
  //     {
  //       '$lookup': {
  //         'from': 'users',
  //         'localField': 'user_id',
  //         'foreignField': '_id',
  //         'as': 'user'
  //       }
  //     }, {
  //       '$project': {
  //         'fullName': 1,
  //         'date': 1,
  //         'is_working': 1,
  //         'position': 1,
  //         'roles': 1,
  //         'user': {
  //           '$arrayElemAt': [
  //             '$user', 0
  //           ]
  //         }
  //       }
  //     }, {
  //       '$group': {
  //         '_id': 1,
  //         'time_track': {
  //           '$push': {
  //             'date': '$date',
  //             'is_working': '$is_working',
  //             'position': '$position',
  //             'roles': '$roles',
  //             'user': '$user'
  //           }
  //         }
  //       }
  //     }, {
  //       '$unwind': {
  //         'path': '$time_track',
  //         'includeArrayIndex': 'index'
  //       }
  //     }, {
  //       '$project': {
  //         'date': '$time_track.date',
  //         'is_working': '$time_track.is_working',
  //         'position': '$time_track.position',
  //         'roles': '$time_track.roles',
  //         'user': '$time_track.user',
  //         'index': 1
  //       }
  //     },
  //     {
  //       '$switch': {
  //         'branches': [
  //           {
  //             'case': {
  //               'index': { '$mod': [2, 0] }
  //             },
  //             'then': ''
  //           }
  //         ]
  //       }
  //     }
  //   ];
  // }

}
