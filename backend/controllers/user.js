const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const passwordValidator = require('password-validator');

const dotenv = require('dotenv');

const User = require('../models/User'); // Importation du modèle User pour l'interaction avec la collection d'utilisateurs dans la base de données

dotenv.config();

// Création d'un schéma pour la validation du mot de passe
const passwordSchema = new passwordValidator();
passwordSchema
    .is().min(12)            // Minimum 12 caractères
    .is().max(100)          // Maximum 100 caractères
    .has().uppercase()      // Doit avoir au moins une lettre majuscule
    .has().lowercase()      // Doit avoir au moins une lettre minuscule
    .has().digits()         // Doit avoir au moins un chiffre
    .has().not().spaces();  // Ne doit pas contenir d'espaces

// Fonction pour l'inscription d'un nouvel utilisateur
exports.signup = (req, res, next) => {

   // Vérifier si le mot de passe satisfait les critères de validation
   if (!passwordSchema.validate(req.body.password)) {
    return res.status(400).json({ error: 'Le mot de passe ne respecte pas les critères de validation' });
}
    // Vérifier si l'utilisateur existe déjà dans la base de données
    User.findOne({ email: req.body.email })
        .then(existingUser => {
            if (existingUser) {
                return res.status(400).json({ error: 'Cet e-mail est déjà utilisé' });
            }

            // Si l'utilisateur n'existe pas, continuer avec la création du nouvel utilisateur
            bcrypt.hash(req.body.password, Number(process.env.BCRYPT_HASH_MULTIPLIER))
                .then(hashedPassword => {
                    // Création d'un nouvel utilisateur avec le mot de passe haché
                    const user = new User({
                        email: req.body.email,
                        password: hashedPassword
                    });
                    // Enregistrement du nouvel utilisateur dans la base de données
                    return user.save();
                })
                .then(() => {
                    res.status(201).json({ message: 'Utilisateur créé avec succès' });
                })
                .catch(error => {
                    res.status(400).json({ error: 'Erreur interne du serveur' });
                });
        })
        .catch(error => {
            res.status(500).json({ error: 'Erreur interne du serveur' });
        });
};

// Fonction pour la connexion d'un utilisateur existant
exports.login = (req, res, next) => {
    User.findOne({ email: req.body.email })
        .then(user => {
            if (!user) {
                return res.status(401).json({ error: 'Utilisateur non trouvé !' });
            }
            // Vérification du mot de passe
            bcrypt.compare(req.body.password, user.password)
                .then(valid => {
                    if (!valid) {
                        return res.status(401).json({ error: 'Mot de passe incorrect !' });
                    }
                    // Si le mot de passe est correct, création d'un jeton d'authentification JWT
                    res.status(200).json({
                        userId: user._id,
                        token: jwt.sign(
                            { userId: user._id },
                            process.env.JWTPASS, // Utilisation de la clé secrète JWT à partir des variables d'environnement
                            { expiresIn: '24h' } 
                        )
                    });
                })
                .catch(error => res.status(500).json({ error }));
        })
        .catch(error => res.status(500).json({ error }));
 };
