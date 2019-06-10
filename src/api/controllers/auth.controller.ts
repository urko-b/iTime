
import { AuthHelper } from '../auth.helper';

export default class AuthController {


  public static async authMiddleware(req, res, next) {
    try {
      if (req.path === '/api/v1/auth' && req.method === 'GET') {
        return next();
      }

      if (req.path === '/socket.io/' && req.method === 'GET') {
        return next();
      }

      if (req.path === '/api/v1/user/login' && req.method === 'POST') {
        return next();
      }

      const authHeader = req.get('Authorization');
      if (!authHeader) {
        return res.status(401).json('Unauthorized');
      }

      const jwtToken = authHeader.slice('Bearer '.length);
      const isValid = await AuthHelper.isValid(jwtToken);
      if (!isValid) {
        return res.status(401).json('Unauthorized');
      }
      return next();
    } catch (e) {
      return res.status(401).json('Unauthorized');
    }
  }
}
