const express = require('express'); // Importation du framework Express pour la création d'une application web
const mongoose = require('mongoose'); // Importation du module Mongoose pour l'interaction avec la base de données MongoDB
const app = express();

const dotenv = require('dotenv'); // Importation du module dotenv pour charger les variables d'environnement à partir du fichier .env

// Importation des routes définies pour les utilisateurs et les livres
const userRoutes = require('./routes/user');
const bookRoutes = require('./routes/book');

dotenv.config();

// Construction de l'URL de connexion à la base de données MongoDB à partir des variables d'environnement
const database_path = `${process.env.DB_HOST}${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_CLUSTER}`;
// Connexion à la base de données MongoDB
mongoose.connect(database_path)
  .then(() => console.log('Connexion à MongoDB réussie !'))
  .catch(() => console.log('Connexion à MongoDB échouée !'));

// Middleware CORS (Cross-Origin Resource Sharing) pour autoriser les requêtes provenant de différents domaines
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*'); // Autoriser toutes les origines
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS'); // Définir les méthodes HTTP autorisées
  next();
});

// Utilisation du middleware intégré pour le traitement des données JSON dans les requêtes
app.use(express.json());
// Utilisation du middleware express.static pour servir les fichiers statiques (par exemple, ici les images) depuis le dossier 'images'
const path = require('path');
app.use('/images', express.static(path.join(__dirname, 'images')));
// Utilisation des routes définies pour les livres et les utilisateurs
app.use('/api/books', bookRoutes);
app.use('/api/auth', userRoutes);

// Exportation de l'application Express pour l'utiliser dans d'autres fichiers (par exemple, server.js)
module.exports = app;
