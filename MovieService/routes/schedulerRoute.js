const express = require('express');
const router = express.Router();
const movieScheduleController = require('../controllers/schedulerController');

router.post('/schedule', movieScheduleController.addMovieToSchedule);
router.get('/aud-schedules/:date', movieScheduleController.getAudSchedulesByDate);
router.put('/seat', movieScheduleController.reserveSeat);
router.get('/showtimes/:movie_uuid/:date', movieScheduleController.getShowtimesByDateAndMovieUuid);
router.get('/seats/:auditorium_uuid/:date/:time', movieScheduleController.getSeats);

module.exports = router;
