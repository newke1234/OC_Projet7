// Schéma de données pour les utilisateurs

const mongoose = require('mongoose');

// Importation du module mongoose-unique-validator pour valider l'unicité des champs
const uniqueValidator = require('mongoose-unique-validator');

const userSchema = mongoose.Schema({
    email: {type:String, required: true, unique: true }, // Champ email requis et unique
    password: { type:String, required: true } // Champ mot de passe requis
});

// Ajout du plugin uniqueValidator au schéma de l'utilisateur pour valider l'unicité des champs
userSchema.plugin(uniqueValidator);

module.exports = mongoose.model('User', userSchema);