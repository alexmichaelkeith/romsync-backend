const express = require('express');
const router = express.Router();
router.get('/test', (request, response) => {
    response.send('success');
});

router.get('/', (request, response) => {
    response.send('success');
});

module.exports = router;