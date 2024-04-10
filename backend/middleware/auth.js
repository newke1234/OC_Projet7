const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

dotenv.config();
 
// Middleware pour l'authentification des utilisateurs à l'aide de jetons JWT
module.exports = (req, res, next) => {
    try {
        // Extraction du jeton JWT du header Authorization de la requête
        const token = req.headers.authorization.split(' ')[1];
        // Vérification et décodage du jeton JWT à l'aide de la clé secrète
        const decodedToken = jwt.verify(token, process.env.JWTPASS);
        // Récupération de l'identifiant de l'utilisateur à partir du jeton décodé
        const userId = decodedToken.userId;
        // Ajout de l'identifiant de l'utilisateur au corps de la requête (req.auth)
        req.auth = {
            userId: userId
        };
        next();
    } catch(error) {
       res.status(403).json({ error });
    }
 };