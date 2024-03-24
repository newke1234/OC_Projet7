const Book = require('../models/Book');

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
      res.status(401).json({ message: 'Non-autorisé'})
    } else {
      Book.updateOne({ _id: req.params.id}, {...bookObject, _id: req.params.id})
      .then(() => res.status(200).json({message : 'Livre modifié'}))
      .catch(error => res.status(401).json({ error }));
    }
    })
  .catch((error) => res.status(400).json({error}));
});

exports.deleteBook = ((req, res, next) => {
    Book.deleteOne({_id: req.params.id}).then(
        () => {
        res.status(200).json({
            message: 'Deleted!'
        });
        }
    ).catch(
        (error) => {
        res.status(400).json({
            error: error
        });
        }
    );
})

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

  exports.rateBook = ((req, res, next) => {
    const book = new Book({
      _id: req.params.id,
      userId: req.body.userId,
      title: req.body.title,
      author: req.body.author,
      imageUrl: req.body.imageUrl,
      year: req.body.year,
    });
    Book.rateOne({_id: req.params.id}, book).then(
      () => {
        res.status(201).json({
          message: 'Rating updated successfully!'
        });
      }
    ).catch(
      (error) => {
        res.status(400).json({
          error: error
        });
      }
    );
  })
