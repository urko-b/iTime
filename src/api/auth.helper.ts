import * as jwt from 'jsonwebtoken';
import DeviceTokenDAO from '../dao/device-token.dao';

export class AuthHelper {

  public static generateJWT(...args) {
    return jwt.sign(
      {
        exp: Math.floor(Date.now() / 1000) + 60 * 60 * 4,
        ...args
      },
      process.env.SECRET_KEY,
    );
  }

  public static async getUserEmail(jwtToken): Promise<string> {
    try {
      let email = '';
      await jwt.verify(jwtToken, process.env.SECRET_KEY, async (error, res) => {
        if (error) {
          return { error };
        }
        email = res['0'].email;
      });
      return email;
    } catch (e) {
      console.error(`AuthHelper getUserEmail ${e}`);
    }
  }

  public static async isValid(jwtToken): Promise<boolean> {
    try {
      let isValid = false;
      await jwt.verify(jwtToken, process.env.SECRET_KEY, async (error, res) => {
        if (error) {
          return { error };
        }

        isValid = await DeviceTokenDAO.exists(res['0'].token);
      });

      return isValid;
    } catch (e) {
      console.error(`AuthHelper isValid ${e}`);
      return false;
    }
  }

  public static async getTokenReceived(jwtToken): Promise<any> {
    try {
      let token;
      await jwt.verify(jwtToken, process.env.SECRET_KEY, async (error, res) => {
        if (error) {
          return { error };
        }

        console.error('token received', res);
        token = res['0'].token;
      });

      return token;
    } catch (e) {
      console.error(`AuthHelper getTokenReceived ${e}`);
      return null;
    }
  }


  public static async getEmailFromAuthHeader(req) {
    try {
      const authHeader = req.get('Authorization');
      const email = await AuthHelper.getUserEmail(authHeader.slice('Bearer '.length));
      return email;
    } catch (e) {
      console.error(`AuthHelper getEmailFromAuthHeader ${e}`);
      return null;
    }
  }
}
