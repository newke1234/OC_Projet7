const express = require('express');
const mongoose = require('mongoose');
const app = express();
const dotenv = require('dotenv');

const Book = require('./models/Book');
const User = require('./models/User');

dotenv.config();

mongoose.connect(process.env.DATABASE)
  .then(() => console.log('Connexion à MongoDB réussie !'))
  .catch(() => console.log('Connexion à MongoDB échouée !'));

app.use(express.json());

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    next();
  });

app.post('/api/auth/signup', (req, res, next) => {
  delete req.body._id;
  const user = new User({
    ...req.body
  });
  user.save()
    .then(() => res.status(201).json({ message: 'Utilisateur enregistre !'}))
    .catch(error => res.status(400).json({ error }));
});

// app.post('/api/auth/login', (req, res, next) => {
//   delete req.body._id;
//   const user = new User({
//     ...req.body
//   });
//   book.save()
//     .then(() => res.status(201).json({ message: 'Utilisateur enregistre !'}))
//     .catch(error => res.status(400).json({ error }));
// });

app.post('/api/book', (req, res, next) => {
  delete req.body._id;
  const book = new Book({
    ...req.body
  });
  book.save()
    .then(() => res.status(201).json({ message: 'Objet enregistre !'}))
    .catch(error => res.status(400).json({ error }));
});

app.put('/api/book/:id', (req, res, next) => {
  Book.updateOne({ _id: req.params.id }, { ...req.body, _id: req.params.id })
    .then(() => res.status(200).json({ message: 'Objet modifié !'}))
    .catch(error => res.status(400).json({ error }));
});

app.delete('/api/book/:id', (req, res, next) => {
  Book.deleteOne({ _id: req.params.id })
    .then(() => res.status(200).json({ message: 'Objet supprime !'}))
    .catch(error => res.status(400).json({ error }));
});

app.get('/api/book', (req, res, next) => {
  Book.find()
  .then( book => res.status(200).json(book))
  .catch(error => res.status(400).json({ error}));
  });

app.get('/api/book/:id', (req, res, next) => {
  Book.findOne({ _id: req.params.id })
    .then(book => res.status(200).json(book))
    .catch(error => res.status(404).json({ error }));
});

module.exports = app;