const express = require('express');
const { list, create, update, remove } = require('../controllers/readingController');
const auth = require('../middleware/auth');

const router = express.Router();

router.use(auth); // everything below needs a logged-in user

router.get('/', list);
router.post('/', create);
router.put('/:id', update);
router.delete('/:id', remove);

module.exports = router;