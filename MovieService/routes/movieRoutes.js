const express = require('express');
const router = express.Router();
const movieController = require('../controllers/movieController');

router.get('/:id', movieController.getMovieInfo);
router.get('/', movieController.getAllMovies);
router.get('/showing', movieController.getAllShowingMovies);
router.put('/:id', movieController.updateMovie);

module.exports = router;
