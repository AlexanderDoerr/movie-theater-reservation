const express = require('express');
const router = express.Router();
const movieScheduleController = require('../controllers/schedulerController');

router.post('/', movieScheduleController.addMovieToSchedule);
router.get('/aud-schedules', movieScheduleController.getAudSchedulesByDate);
router.put('/seat', movieScheduleController.reserveSeat);
router.get('/showtimes', movieScheduleController.getShowtimesByDateAndMovieUuid);
router.get('/seats', movieScheduleController.getSeats);

module.exports = router;

