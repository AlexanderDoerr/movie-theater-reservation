const express = require('express');
const router = express.Router();
const movieScheduleController = require('../controllers/schedulerController');

router.post('/', movieScheduleController.addMovieToSchedule);
router.post('/aud-schedules', movieScheduleController.getAudSchedulesByDate);
router.put('/seat', movieScheduleController.reserveSeat);
router.post('/showtimes', movieScheduleController.getShowtimesByDateAndMovieUuid);
router.post('/seats', movieScheduleController.getSeats);

module.exports = router;

