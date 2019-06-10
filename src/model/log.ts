
export class Log {
  public date: Date;
  public operation: string;
  public collection_name: string;
  public payload: string;
  public old_value: string;
  public new_value: string;

  constructor({
    operation = null,
    collection_name = null,
    payload = null,
    old_value = null,
    new_value = null
  }) {
    this.operation = operation;
    this.collection_name = collection_name;
    this.payload = payload;
    this.old_value = old_value;
    this.new_value = new_value;
  }
}
