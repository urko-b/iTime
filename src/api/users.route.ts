import { Router } from 'express';
import usersCtrl from './controllers/users.controller';

// @ts-ignore
const router = new Router();

router.route('/').get(usersCtrl.GetUsers);
router.route('/login').post(usersCtrl.login);
router.route('/roles').get(usersCtrl.GetUserRoles);

export default router;
