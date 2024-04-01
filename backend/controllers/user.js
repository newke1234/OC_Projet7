const  bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

const User = require('../models/User');

dotenv.config();


exports.signup = (req, res, next) => {
    // Vérifier si l'utilisateur existe déjà dans la base de données
    User.findOne({ email: req.body.email })
        .then(existingUser => {
            if (existingUser) {
                return res.status(400).json({ error: 'Cet e-mail est déjà utilisé' });
            }

            // Si l'utilisateur n'existe pas, continuer avec la création du nouvel utilisateur
            bcrypt.hash(req.body.password, 10)
                .then(hashedPassword => {
                    const user = new User({
                        email: req.body.email,
                        password: hashedPassword
                    });
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

exports.login = (req, res, next) => {
    User.findOne({ email: req.body.email })
        .then(user => {
            if (!user) {
                return res.status(401).json({ error: 'Utilisateur non trouvé !' });
            }
            bcrypt.compare(req.body.password, user.password)
                .then(valid => {
                    if (!valid) {
                        return res.status(401).json({ error: 'Mot de passe incorrect !' });
                    }
                    res.status(200).json({
                        userId: user._id,
                        token: jwt.sign(
                            { userId: user._id },
                             process.env.JWTPASS,
                            { expiresIn: '24h' }
                        )
                    });
                })
                .catch(error => res.status(500).json({ error }));
        })
        .catch(error => res.status(500).json({ error }));
 };