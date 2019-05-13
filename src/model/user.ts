import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export class User {
  public name: string;
  public email: string;
  public password: string;
  public preferences: any;

  constructor(name?: string, email?: string, password?: string, preferences = {}) {
    this.name = name;
    this.email = email;
    this.password = password;
    this.preferences = preferences;
  }
  public toJson() {
    return { name: this.name, email: this.email, preferences: this.preferences };
  }
  public async comparePassword(plainText) {
    return await bcrypt.compare(plainText, this.password);
  }
  public encoded() {
    return jwt.sign(
      {
        exp: Math.floor(Date.now() / 1000) + 60 * 60 * 4,
        ...this.toJson(),
      },
      process.env.SECRET_KEY,
    );
  }

  public static async decoded(userJwt) {
    return jwt.verify(userJwt, process.env.SECRET_KEY, (error, res) => {
      if (error) {
        return { error }
      }
      return new User(res)
    });
  }
}
