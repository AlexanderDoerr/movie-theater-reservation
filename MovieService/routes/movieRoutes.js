const express = require('express');
const router = express.Router();
const movieController = require('../controllers/movieController');

router.get('/movie/:id', movieController.getMovieInfo);
router.get('/movies', movieController.getAllMovies);
router.get('/movies/showing', movieController.getAllShowingMovies);
router.put('/movie/:id', movieController.updateMovie);

module.exports = router;
