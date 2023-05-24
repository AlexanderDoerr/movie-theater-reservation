const express = require('express');
const router = express.Router();
const movieController = require('../controllers/movieController');

router.get('/:id', movieController.getMovieInfo);
router.get('/', movieController.getAllMovies);
router.get('/showing', movieController.getAllShowingMovies);
router.put('/:id', movieController.updateMovie);

module.exports = router;


// router.get('/list/:movieId', movieSchedulerController.getMovieSchedule);
// router.get('/list', movieSchedulerController.getMovieScheduleList);
// router.post('/list', movieSchedulerController.createMovieSchedule);
// router.put('/list/:movieId', movieSchedulerController.updateMovieSchedule);
// router.delete('/list/:movieId', movieSchedulerController.deleteMovieSchedule);

module.exports = router;
