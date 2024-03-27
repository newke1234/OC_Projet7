const Book = require('../models/Book');
const fs = require('fs');


exports.createBook = (req, res, next) => {
// Vérifier s'il y a un fichier téléchargé
  if (!req.file) {
    return res.status(400).json({ error: 'Aucune image téléchargée' });
  }

  const bookObject = req.body;
  console.log(bookObject);
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
    ...req.body,
    imageUrl:`${req.protocol}://${req.get('host')}/images/${req.file.filename}`
  } : { ...req.body };

  delete bookObject._userId;
  Book.findOne({_id: req.params.id})
  .then((book) => {
    if (book.userId != req.auth.userId) {
      res.status(403).json({ message: 'unauthorized request'})
    } else {
      Book.updateOne({ _id: req.params.id}, {...bookObject, _id: req.params.id})
      .then(() => res.status(200).json({message : 'Livre modifié'}))
      .catch(error => res.status(401).json({ error }));
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
  })

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
    const { userId, grade } = req.body;
    const bookId = req.params.id;

    // Vérifier si la note est dans la plage autorisée (0 à 5)
    if (grade < 0 || grade > 5) {
        return res.status(400).json({ error: 'La note doit être comprise entre 0 et 5' });
    }

    Book.findById(bookId)
        .then(book => {
            if (!book) {
                return res.status(404).json({ error: 'Livre non trouvé' });
            }

            const existingRatingIndex = book.ratings.findIndex(rating => rating.userId === userId);
            if (existingRatingIndex !== -1) {
                return res.status(400).json({ error: 'L\'utilisateur a déjà noté ce livre' });
            }

            book.ratings.push({ userId, grade });

            const totalGrades = book.ratings.reduce((sum, rating) => sum + rating.grade, 0); // Calcul totalGrades = somme de toutes les notes du tableau "ratings"
            const averageGrade = totalGrades / book.ratings.length;
            book.averageRating = averageGrade;

            return book.save();
        })
        .then(() => {
            return res.status(200).json({ message: 'Note ajoutée avec succès' });
        })
        .catch(error => {
          console.log(error);
            return res.status(500).json({ error: 'Erreur interne du serveur' });
        });
};
