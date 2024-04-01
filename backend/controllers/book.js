const Book = require('../models/Book');
const fs = require('fs');

exports.createBook = (req, res, next) => {
// Vérifier s'il y a un fichier téléchargé
  if (!req.file) {
    return res.status(400).json({ error: 'Aucune image téléchargée' });
  }
  const bookObject = JSON.parse(req.body.book);
  delete bookObject._id;
  delete bookObject._userId;
  const book = new Book({
    ...bookObject,
    userId: req.auth.userId,
    imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`});

  book.save()
  .then(() => { res.status(201).json({message: 'Livre enregistré !' })})
  .catch(error => {res.status(400).json({ error })})
};
    
exports.modifyBook = ((req, res, next) => {
  const bookObject = req.file ? {
    ...JSON.parse(req.body.book),
    imageUrl:`${req.protocol}://${req.get('host')}/images/${req.file.filename}`
  } : {...req.body};

  delete bookObject._userId;
  Book.findOne({_id: req.params.id})
  .then((book) => {
    if (book.userId != req.auth.userId) {
      res.status(403).json({ message: 'Vous n\'êtes pas autorisé à modifier ce livre '})
    } else {
      Book.updateOne({ _id: req.params.id}, {...bookObject, _id: req.params.id})
      .then(() => res.status(200).json({message : 'Livre modifié'}))
      .catch(error => res.status(401).json({ error }));
      if (req.file) {
        // Supprimer l'image existante si elle existe
        const imagePath = book.imageUrl.split('/images/')[1];
        fs.unlink(`images/${imagePath}`, (err) => {
            if (err) {
                console.error("Erreur lors de la suppression de l'image existante :", err);
            }
        });
    }
    }

    })
  .catch((error) => res.status(400).json({error}));
});

exports.deleteBook = (req, res, next) => {
  Book.findOne({ _id: req.params.id})
      .then(book => {
          if (book.userId != req.auth.userId) {
              res.status(403).json({message: 'unauthorized request'});
          } else {
              const filename = book.imageUrl.split('/images/')[1];
              fs.unlink(`images/${filename}`, () => {
                  Book.deleteOne({_id: req.params.id})
                      .then(() => { res.status(200).json({message: 'Objet supprimé !'})})
                      .catch(error => res.status(401).json({ error }));
              });
          }
      })
      .catch( error => {
          res.status(500).json({ error });
      });
};

exports.getAllBook = ((req, res, next) => {
    Book.find().then(
      (books) => {
        res.status(200).json(books);
      }
    ).catch(
      (error) => {
        res.status(400).json({
          error: error
        });
      }
    );
  });

  exports.getOneBook = ((req, res, next) => {
    Book.findOne({
      _id: req.params.id
    }).then(
      (book) => {
        res.status(200).json(book);
      }
    ).catch(
      (error) => {
        res.status(404).json({
          error: error
        });
      }
    );
  })

exports.addRating = (req, res, next) => {
  Book.findOne({ _id: req.params.id })
      .then(book => {
          // Vérifie que la note est comprise entre 1 et 5 et qu'une note n'a pas déja été attribuer par cette utilisateur
          if (book.ratings.some(rating => rating.userId === req.userId) || (req.body.grade < 1 || req.body.grade > 5)) {
              res.status(500).json({ error: 'Erreur lors de la notation' });
          } else {
              // Ajoute la nouvelle évaluation
              const obj = {
                userId: req.body.userId,
                grade: req.body.rating
              };
              book.ratings.push(obj);
              // Calcule la nouvelle moyenne des notes
              const totalRatings = book.ratings.length;
              const sumOfRatings = book.ratings.reduce((acc, rating) => acc + rating.grade, 0);
              book.averageRating = sumOfRatings / totalRatings;
              // Sauvegarde le livre
              book.save()
                  .then(book => {
                      res.status(200).json(book);
                  })
                  .catch(error => res.status(500).json({ error }));
          }
      })
      .catch(error => res.status(404).json({ error }));
};

exports.getBestRating = (req, res, next) => {
  Book.find().sort({ averageRating: -1 }).limit(3)
      .then(book => {
          res.status(200).json(book);
      })
      .catch(error => {
          res.status(500).json({ error: 'Erreur interne du serveur' });
      });
};