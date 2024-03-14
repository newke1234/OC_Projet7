const express = require('express');
const router = express.Router();

const bookCtrl = require('../controllers/book');

router.get('/' +
  '', bookCtrl.getAllBook);

router.get('/:id', bookCtrl.getOneBook);

// router.get('/:id', bookCtrl.getBestRatingBook);

router.post('/', bookCtrl.createBook);

router.put('/:id', bookCtrl.modifyBook);

router.delete('/:id', bookCtrl.deleteBook);

// router.post('/:id', bookCtrl.rateBook)


module.exports = router;
