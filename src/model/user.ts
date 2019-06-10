import { compare } from 'bcryptjs';

export class User {
  public name: string;
  public email: string;
  public password: string;
  public preferences: any;

  constructor({ name = '', email = '', password = '', preferences = {} } = {}) {
    this.name = name;
    this.email = email;
    this.password = password;
    this.preferences = preferences;
  }
  public async comparePassword(plainText) {
    return await compare(plainText, this.password);
  }

}
