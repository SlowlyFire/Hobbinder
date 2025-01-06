const expoTokensController = require('../controllers/expoTokens');
const express = require('express');
const router = express.Router();

router.route('/')
    .post(expoTokensController.addNewToken)
    .get(expoTokensController.getTokens);  // Optional: if you want to get all tokens

router.route('/:username')
    .get(expoTokensController.getTokenByUsername)  // Optional: if you want to get token by username
    .delete(expoTokensController.removeToken);     // Optional: if you want to delete token

module.exports = router;