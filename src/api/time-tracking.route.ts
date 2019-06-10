import { Router } from 'express';
import TimeTrackingController from './controllers/time-tracking.controller';

// @ts-ignore
const router = new Router();


router
  .route('/')
  .get(TimeTrackingController.apiGetTrackings)
  .post(TimeTrackingController.apiPostTrack);
router.route('/isWorking').post(TimeTrackingController.apiIsWorking);
router.route('/todayTrackings').post(TimeTrackingController.apiGetTodayTrackings);

router.route('/timeTrackingBagSumYear').get(TimeTrackingController.apiTimeTrackingBagSumToday);

export default router;
