const Book = require('../models/Book');

exports.createBook = (req, res, next) => {
  const bookObject = req.body;
  const book = new Book({
    ...bookObject,
    userId: req.auth.userId, imageUrl: `${req.protocol}://${req.get('host')}/images/`  });
  book.save()
  .then(() => { res.status(201).json({message: 'Objet enregistré !' })})
  .catch(error => {res.status(400).json({ error })})
};
    

exports.modifyBook = ((req, res, next) => {
    const book = new Book({
      _id: req.params.id,
      userId: req.body.userId,
      title: req.body.title,
      author: req.body.author,
      imageUrl: req.body.imageUrl,
      year: req.body.year,
    });
    Book.updateOne({_id: req.params.id}, book).then(
      () => {
        res.status(201).json({
          message: 'Book updated successfully!'
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
