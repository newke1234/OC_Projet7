const express = require('express');
const router = express.Router();

const userCtrl = require('../controllers/user');

router.post('/', userCtrl.createUser);

// router.get('/:id', userCtrl.getOneUser);

// router.put('/:id', userCtrl.modifyUser);

// router.get('/' +
//   '', userCtrl.getAllUser);

// router.delete('/:id', userCtrl.deleteUser);

module.exports = router;