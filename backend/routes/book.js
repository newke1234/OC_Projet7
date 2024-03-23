const express = require('express');
const auth = require('../middleware/auth');
const router = express.Router();

const bookCtrl = require('../controllers/book');

router.get('/', bookCtrl.getAllBook);
router.get('/:id', bookCtrl.getOneBook);
router.post('/', auth, bookCtrl.createBook);
router.put('/:id', auth, bookCtrl.modifyBook);
router.delete('/:id', auth, bookCtrl.deleteBook);
// router.post('/:id', bookCtrl.rateBook);
// router.get('/:id', bookCtrl.getBestRatingBook);


module.exports = router;
