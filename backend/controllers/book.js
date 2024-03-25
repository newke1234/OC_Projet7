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

exports.addRating = async (req, res) => {
    const { userId, grade } = req.body;
    const bookId = req.params.bookId;

    try {
        // Vérifier si le livre existe
        const book = await Book.findById(bookId);
        if (!book) {
            return res.status(404).json({ error: 'Book not found' });
        }

        // Vérifier si l'utilisateur a déjà noté ce livre
        const existingRatingIndex = book.ratings.findIndex(rating => rating.userId === userId);
        if (existingRatingIndex !== -1) {
            return res.status(400).json({ error: 'User has already rated this book' });
        }

        // Ajouter la note à la liste des notations du livre
        book.ratings.push({ userId, grade });

        // Calculer la nouvelle note moyenne du livre
        const totalGrades = book.ratings.reduce((sum, rating) => sum + rating.grade, 0);
        const averageGrade = totalGrades / book.ratings.length;
        book.averageRating = averageGrade;

        // Sauvegarder le livre mis à jour dans la base de données
        await book.save();

        res.status(200).json({ message: 'Rating added successfully', book });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};