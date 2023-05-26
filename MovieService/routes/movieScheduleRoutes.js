const express = require('express');
const router = express.Router();
const movieScheduleController = require('../controllers/movieScheduleController');

router.post('/schedule', movieScheduleController.addMovieToSchedule);
router.get('/aud-schedules/:date', movieScheduleController.getAudSchedulesByDate);
router.put('/seat', movieScheduleController.reserveSeat);
router.get('/showtimes', movieScheduleController.getShowtimesByDateAndMovieUuid);
router.post('/schedule-event', movieScheduleController.scheduleMovieEvent);
router.get('/seats', movieScheduleController.getSeats);

module.exports = router;
