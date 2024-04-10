const express = require('express');
const auth = require('../middleware/auth');
const router = express.Router();
const multer = require('../middleware/multer-config'); // Importation du middleware multer pour la gestion des fichiers téléchargés

// Importation du contrôleur de livres contenant la logique métier associée aux routes
const bookCtrl = require('../controllers/book');

// Définition des différentes routes pour les opérations CRUD sur les livres
router.get('/bestrating', bookCtrl.getBestRating);
router.get('/', bookCtrl.getAllBook);
router.get('/:id', bookCtrl.getOneBook);
router.post('/', auth, multer(false), bookCtrl.createBook);
router.put('/:id', auth, multer(true), bookCtrl.modifyBook);
router.delete('/:id', auth, bookCtrl.deleteBook);
router.post('/:id/rating', auth, bookCtrl.addRating);

module.exports = router;
