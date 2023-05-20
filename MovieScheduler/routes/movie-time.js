const router = require('express').Router();

const movieSchedulerController = require('./controllers/movie-time-controller');

router.get('/time/:movieId', movieSchedulerController.getMovieSchedule);
router.get('/time', movieSchedulerController.getMovieScheduleList);
router.post('/time', movieSchedulerController.createMovieSchedule);
router.put('/time/:movieId', movieSchedulerController.updateMovieSchedule);
router.delete('/time/:movieId', movieSchedulerController.deleteMovieSchedule);

module.exports = router;