const router = require('express').Router();
const movieSchedulerController = require('./controllers/movie-scheduler-controller');

router.get('/schedule/:movieId', movieSchedulerController.getMovieSchedule);

module.exports = router;
