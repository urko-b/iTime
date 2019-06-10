import TimeTrackingDAO from '../../dao/time-tracking.dao';
import { AuthHelper } from '../auth.helper';

export default class WorkedHoursController {
  public static async apiGetWorkedHours(req, res, next) {
    try {
      const from = req.query.from || null;
      const to = req.query.to || null;
      const workedHours = await apiGetFromToWorkedHours(req, from, to);

      res.json(workedHours);
    } catch (e) {
      console.error(`WorkedHoursController apiGetWorkedHours ${e}`);
      res.status(500).json({ e });
    }
  }

  public static async apiGetWorkedHoursSum(req, res, next) {
    try {

      req.body['email'] = req.query.email || await AuthHelper.getEmailFromAuthHeader(req);
      const from = req.query.from || null;
      const to = req.query.to || null;
      if (from !== null) { req.body['from'] = from; }
      if (to !== null) { req.body['to'] = to; }

      const sum = await TimeTrackingDAO.getSumFromToBagOfHoursWorked(req.body);
      res.json(sum);
    } catch (e) {
      console.error(`WorkedHoursController apiGetWorkedHoursSum ${e}`);
      res.status(500).json({ e });
    }
  }


}

const apiGetFromToWorkedHours = async (req: any, from = null, to = null) => {
  try {
    req.body['email'] = req.query.email || await AuthHelper.getEmailFromAuthHeader(req);
    if (from !== null) { req.body['from'] = from; }
    if (to !== null) { req.body['to'] = to; }

    const bagOfHoursWorked = await TimeTrackingDAO.getFromToBagOfHoursWorked(req.body);
    return bagOfHoursWorked;
  } catch (e) {
    console.error(`WorkedHoursController apiGetFromToWorkedHours ${e}`);
    return null;
  }
}

