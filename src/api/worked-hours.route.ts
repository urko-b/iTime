import { Router } from 'express';
import WorkedHoursController from './controllers/worked-hours.controller';

// @ts-ignore
const router = new Router();


router
  .route('/')
  .get(WorkedHoursController.apiGetWorkedHours);

router.route('/todayWorkedHours').get(WorkedHoursController.apiGetWorkedHoursSum);

export default router;
