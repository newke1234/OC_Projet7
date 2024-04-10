const http = require('http'); // Importation du module HTTP intégré à Node.js
const dotenv = require('dotenv'); // Importation de la bibliothèque dotenv pour charger les variables d'environnement à partir du fichier .env
const app = require('./app'); // Importation de l'application express depuis le fichier app.js

// Chargement des variables d'environnement à partir du fichier .env
dotenv.config();

// Fonction pour normaliser le port fourni en entrée
const normalizePort = val => {
  const port = parseInt(val, 10);

  if (isNaN(port)) {
    return val;
  }
  if (port >= 0) {
    return port;
  }
  return false;
};
// Définition du port sur lequel l'application va écouter
const port = normalizePort(process.env.PORT || '3000');
app.set('port', port);

// Gestionnaire d'erreur pour le serveur
const errorHandler = error => {
  if (error.syscall !== 'listen') {
    throw error;
  }
  const address = server.address();
  const bind = typeof address === 'string' ? 'pipe ' + address : 'port: ' + port;
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges.');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use.');
      process.exit(1);
      break;
    default:
      throw error;
  }
};

// Création du serveur HTTP en utilisant l'application express
const server = http.createServer(app);

// Gestion des erreurs du serveur
server.on('error', errorHandler);
// Écouteur d'événement pour le démarrage du serveur
server.on('listening', () => {
  const address = server.address();
  const bind = typeof address === 'string' ? 'pipe ' + address : 'port ' + port;
  console.log('Listening on ' + bind);
});

// Démarrage du serveur en écoutant sur le port défini
server.listen(port);
