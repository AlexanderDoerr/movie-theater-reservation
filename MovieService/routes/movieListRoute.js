const express = require('express');
const router = express.Router();
const movieListController = require('../controllers/movieListController');

router.get('/', movieListController.getAllMovies);
router.get('/:id', movieListController.getMovieInfo);
router.get('/get/showing', movieListController.getAllShowingMovies);
router.put('/:id', movieListController.updateMovie);

module.exports = router;
