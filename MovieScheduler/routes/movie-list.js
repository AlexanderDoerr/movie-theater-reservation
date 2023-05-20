const router = require('express').Router();
const movieSchedulerController = require('./controllers/movie-list-controller');

router.get('/list/:movieId', movieSchedulerController.getMovieSchedule);
router.get('/list', movieSchedulerController.getMovieScheduleList);
router.post('/list', movieSchedulerController.createMovieSchedule);
router.put('/list/:movieId', movieSchedulerController.updateMovieSchedule);
router.delete('/list/:movieId', movieSchedulerController.deleteMovieSchedule);

module.exports = router;
