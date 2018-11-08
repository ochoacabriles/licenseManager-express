var express = require('express');
    var router = express.Router();
var getUpdates = require('../controllers/getUpdates')
var register = require('../controllers/register')

// Receive shopify webhooks.
router.post('/', (req, res, next) => {
    getUpdates.update(req.body.id, (message) => {
    })
    res.send('OK')
});

// Activate rig
router.post('/register', (req, res, next) => {
    register.check(req.body, 'activate', (message) => {
        res.send(message)
    })
})

// Check if rig is activated
router.get('/register', (req, res, next) => {
    register.check(req.query, 'check', (message) => {
        res.send(message)        
    })
})

// Deactivate rig or rigs
router.delete('/register', (req, res, next) => {
    register.check(req.body, 'delete', (message) => {
        res.send(message)
    })
})

module.exports = router;