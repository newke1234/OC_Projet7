const User = require('../models/User');

exports.createUser = ((req, res, next) => {
    delete req.body._id;
    const user = new User({
      ...req.body
    });
    user.save()
      .then(() => res.status(201).json({ message: 'Utilisateur enregistre !'}))
      .catch(error => res.status(400).json({ error }));
});
