import { ObjectId } from 'bson';

export class TimeTrack {
  public user_id: ObjectId;
  public date: Date;
  public type: string;

  constructor(user_id?: ObjectId, date?: Date, type?: string) {
    this.user_id = user_id;
    this.date = date;
    this.type = type;
  }

}
