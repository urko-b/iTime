import { ObjectId } from 'mongodb';

export class DeviceToken {
  public _id: ObjectId;
  public name: string;
  public token: string;

  constructor(_id?: ObjectId, name?: string, token?: string) {
    this._id = _id;
    this.name = name;
    this.token = token;
  }
}
