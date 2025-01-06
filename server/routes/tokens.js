const tokensController = require('../controllers/tokens.js');

const express = require('express');
const router = express.Router();

router.route('/').post(tokensController.createToken);
router.route('/validate-token').post(tokensController.validateToken);

module.exports = router;