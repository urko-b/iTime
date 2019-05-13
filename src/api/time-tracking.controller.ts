import { ObjectId } from 'mongodb';
import TimeTrackingDAO from '../dao/time_tracking.dao';


export default class TimeTrackingController {
  public static async apiGetMovies(req, res, next) {
    const MOVIES_PER_PAGE = 20
    const card_id = req.id;
    const trackings = await TimeTrackingDAO.getTrackingsByCard(card_id);
    const response = {
      trackings,
      page: 0,
      filters: {},
      entries_per_page: MOVIES_PER_PAGE
    };
    res.json(response);
  }

  public static async apiPostTrack(req, res, next) {
    try {
      // const userJwt = req.get("Authorization").slice("Bearer ".length)
      // const user = await User.decoded(userJwt)
      // var { error } = user
      // if (error) {
      //   res.status(401).json({ error })
      //   return
      // }

      const cardId = req.body.card_id;
      const date = req.body.date;

      const trackingResponse = await TimeTrackingDAO.AddTracking(
        new ObjectId(cardId),
        date,
      );

      res.json({ status: 'success', comments: trackingResponse });
    } catch (e) {
      res.status(500).json({ e });
    }
  }
}
