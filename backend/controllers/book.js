const Book = require('../models/Book');
const fs = require('fs');

const dotenv = require('dotenv');

dotenv.config();

// Fonction pour ajouter l'URL de l'image à un livre
const addUrl = (book) => {
  book.imageUrl = `${process.env.HOST}:${process.env.PORT}/${process.env.IMAGES_FOLDER}/${book.imageUrl}`
}

// Fonction pour créer un nouveau livre
exports.createBook = (req, res, next) => {

  if (!req.file) {// Vérifier s'il y a un fichier téléchargé
    return res.status(400).json({ error: 'Aucune image téléchargée' });
  }
  const bookObject = JSON.parse(req.body.book); // Extraction des données du livre à partir du corps de la requête
  delete bookObject._userId;   // Suppression du champ _userId pour des raisons de sécurité
  const book = new Book({ // Création d'une nouvelle instance du modèle Book avec les données du livre et l'ID de l'utilisateur
    ...bookObject,
    userId: req.auth.userId,
    imageUrl: `${req.file.filename}`
  });

  // Enregistrement du livre dans la base de données
  book.save()
    .then(() => { res.status(201).json({ message: 'Livre enregistré !' })})
    .catch(error => {res.status(400).json({ error })})
};
    
// Fonction pour modifier un livre existant
exports.modifyBook = ((req, res, next) => {

  // Vérification si un fichier est téléchargé pour mettre à jour l'image du livre
  const bookObject = req.file ? {
    ...JSON.parse(req.body.book),
    imageUrl:`${req.file.filename}`
  } : {...req.body};
   delete bookObject._userId;

  // Recherche du livre dans la base de données par son ID
  Book.findOne({_id: req.params.id})
  .then((book) => {
    // Vérification de l'autorisation de modification du livre
    if (book.userId != req.auth.userId) {
      res.status(403).json({ message: 'Vous n\'êtes pas autorisé à modifier ce livre '})
    } else {
      // Mise à jour du livre dans la base de données
      Book.updateOne({ _id: req.params.id}, {...bookObject, _id: req.params.id})
      .then(() => res.status(200).json({message : 'Livre modifié'}))
      .catch(error => res.status(401).json({ error }));
      // Suppression de l'image existante si un nouveau fichier est téléchargé
      if (req.file) {
        const imagePath = book.imageUrl;
        fs.unlink(`${process.env.IMAGES_FOLDER}/${imagePath}`, (err) => {
            if (err) {
                console.error("Erreur lors de la suppression de l'image existante :", err);
            }
        });
    }
    }

    })
  .catch((error) => res.status(400).json({error}));
});

// Fonction pour supprimer un livre
exports.deleteBook = (req, res, next) => {
  Book.findOne({ _id: req.params.id})
      .then(book => {
          if (book.userId != req.auth.userId) {
              res.status(403).json({message: 'Vous n\'êtes pas autorisé à supprimer ce livre '});
          } else {
              // Suppression de l'image associée au livre dans le dossier d'images
              const filename = book.imageUrl;
              fs.unlink(`${process.env.IMAGES_FOLDER}/${filename}`, () => {
                  // Suppression du livre dans la base de données
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

// Fonction pour récupérer tous les livres
exports.getAllBook = ((req, res, next) => {
    Book.find().then(
      (books) => {
        // Ajout de l'URL de l'image à chaque livre
        books.forEach(addUrl);
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

// Fonction pour récupérer un livre par son ID
exports.getOneBook = ((req, res, next) => {
    // Recherche du livre dans la base de données par son ID
    Book.findOne({
      _id: req.params.id
    }).then(
      (book) => {
        // Ajout de l'URL de l'image au livre
        addUrl(book);
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

// Fonction pour ajouter une évaluation à un livre
exports.addRating = (req, res, next) => {
  Book.findOne({ _id: req.params.id })
      .then(book => {
          // Vérification si l'utilisateur a déjà noté le livre ou si la note est valide
          if (book.ratings.some(rating => rating.userId === req.userId) || (req.body.grade < 0 || req.body.grade > 5)) {
              res.status(500).json({ error: 'Erreur lors de la notation : La note doit être comprise entre 0 et 5' });
          } else {
              // Création d'une nouvelle évaluation
              const note = {
                userId: req.body.userId,
                grade: req.body.rating
              };
              book.ratings.push(note); // Ajout de l'évaluation à la liste des évaluations du livre
              // Calcul de la nouvelle moyenne des notes du livre
              const totalRatings = book.ratings.length;
              const sumOfRatings = book.ratings.reduce((acc, rating) => acc + rating.grade, 0);
              book.averageRating = sumOfRatings / totalRatings;
              // Sauvegarde du livre mis à jour dans la base de données
              book.save()
                  .then(book => {
                      // Ajout de l'URL de l'image au livre
                      addUrl(book);
                      res.status(200).json(book);
                  })
                  .catch(error => res.status(500).json({ error }));
          }
      })
      .catch(error => res.status(404).json({ error }));
};

// Fonction pour récupérer les livres avec les meilleures notes
exports.getBestRating = (req, res, next) => {
  // Recherche des livres dans la base de données, triés par note moyenne dans l'ordre décroissant et limités à 3
  Book.find().sort({ averageRating: -1 }).limit(3)
      .then(books => {
        books.forEach(addUrl)
        res.status(200).json(books);
      })
      .catch(error => {
          res.status(500).json({ error: 'Erreur interne du serveur' });
      });
};
