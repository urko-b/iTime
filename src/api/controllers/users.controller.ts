import { hash } from 'bcryptjs';


import UsersDAO from '../../dao/users.dao';
import { User } from '../../model/user';
import { AuthHelper } from '../auth.helper';

const hashPassword = async password => await hash(password, 10);

export default class UserController {
  public static async login(req, res, next) {
    try {

      const { email, password } = req.body;
      if (!email || typeof email !== 'string') {
        res.status(400).json({ error: 'Bad email format, expected string.' });
        return;
      }
      if (!password || typeof password !== 'string') {
        res.status(400).json({ error: 'Bad password format, expected string.' });
        return;
      }

      const userData = await UsersDAO.getUserByEmail(email);
      if (!userData) {
        res.status(401).json({ error: 'Make sure your email is correct.' });
        return;
      }
      const user = new User(userData);
      if (!await user.comparePassword(password)) {
        res.status(401).json({ error: 'Make sure your password is correct.' });
        return;
      }

      const token = req.get('Authorization');
      res.send(AuthHelper.generateJWT({ token, email: user.email }));
    } catch (e) {
      console.log(e);
      res.status(400).json({ error: e });
      return;
    }
  }

  public static async GetUsers(req, res, next) {
    try {
      const users = await UsersDAO.getUsers();
      res.send(users);
    } catch (e) {
      console.log(e);
      res.status(400).json({ error: e });
      return;
    }
  }

  public static async GetUserRoles(req, res, next) {
    try {
      const email = await AuthHelper.getEmailFromAuthHeader(req);
      const user = await UsersDAO.getUserByEmail(email);
      res.json(user.roles);
    } catch (e) {
      res.status(500).json({ e });
    }
  }

}
