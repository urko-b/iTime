import TimeTrackingDAO from '../../dao/time-tracking.dao';
import { AuthHelper } from '../auth.helper';
import * as moment from 'moment';


export default class TimeTrackingController {
  public static async apiGetTrackings(req, res, next) {
    try {
      const rows = req.params.rows || 10;
      const page = req.params.page || 0;
      const email = await AuthHelper.getEmailFromAuthHeader(req);

      const trackings = await TimeTrackingDAO.getTrackings({ email, rows, page });
      res.json(trackings);
    } catch (e) {
      console.error(`TimeTrackingController apiGetTrackings ${e}`);
      res.status(500).json({ e });
    }
  }

  public static async apiPostTrack(req, res, next) {
    try {
      const io = req.app.get('io');
      req.body['email'] = await AuthHelper.getEmailFromAuthHeader(req);
      const isWorking = await TimeTrackingDAO.addTracking(req.body);

      io.emit('timeTrackAdded');
      res.json({ isWorking });
    } catch (e) {
      console.error(`TimeTrackingController apiPostTrack ${e}`);
      res.status(500).json({ e });
    }
  }

  public static async apiGetTodayTrackings(req, res, next) {
    try {
      req.body['email'] = await AuthHelper.getEmailFromAuthHeader(req);
      const trackings = await TimeTrackingDAO.getTrackingsByUserAndDate(req.body);
      res.json(trackings);
    } catch (e) {
      console.error(`TimeTrackingController apiGetTodayTrackings ${e}`);
      res.status(500).json({ e });
    }
  }


  public static async apiIsWorking(req, res, next) {
    try {
      req.body['email'] = await AuthHelper.getEmailFromAuthHeader(req);
      const isWorking: boolean = await TimeTrackingDAO.isWorking(req.body);
      res.json({ isWorking });
    } catch (e) {
      console.error(`TimeTrackingController apiIsWorking ${e}`);
      res.status(500).json({ e });
    }
  }


  public static async apiTimeTrackingBagSumToday(req, res, next) {
    try {
      req.body['email'] = req.query.email || await AuthHelper.getEmailFromAuthHeader(req);;
      req.body['from'] = moment().startOf('year').toDate();
      req.body['to'] = moment().endOf('year').toDate();
      const sum = await TimeTrackingDAO.getSumFromToBagOfHoursWorked(req.body);

      res.json(sum);
    } catch (e) {
      console.error(`TimeTrackingController apiTimeTrackingBagSumToday ${e}`);
      res.status(500).json({ e });
    }
  }
}

