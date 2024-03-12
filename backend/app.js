const express = require('express');
const mongoose = require('mongoose');
const app = express();

const Book = require('./models/Book');
const User = require('./models/User');

mongoose.connect('mongodb+srv://user_admin:l7o5sgQoIaEq0Q0f@cluster0.aop5puc.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0'
  // { useNewUrlParser: true,
    // useUnifiedTopology: true }
)
  .then(() => console.log('Connexion à MongoDB réussie !'))
  .catch(() => console.log('Connexion à MongoDB échouée !'));

app.use(express.json());

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    next();
  });

app.post('/api/book', (req, res, next) => {
  delete req.body._id;
  const book = new Book({
    ...req.body
  });
  Book.save()
    .then(() => res.status(201).json({ message: 'Objet enregistre !'}))
    .catch(error => res.status(400).json({ error }));
});

app.put('/api/stuff/:id', (res, res, next) => {
  Book.updateOne({ _id: req.params.id }, { ...req.body, _id: req.params.id })
  .then(book => res.status(200).json(book))
  .catch(error => res.status(400).json({ error}));
})

app.delete('/api/stuff/:id', (req, res, next) => {
  Book.deleteOne({ _id: req.params.id })
    .then(() => res.status(200).json({ message: 'Objet supprimé !'}))
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