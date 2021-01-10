const express = require("express"),
router = express.Router();

router.get('/home/user', (req, res) => { 
    res.send('working');
})
router.get('/:data', (req, res) => {
    let data = req.params.data;
    res.send(data);
});

module.exports = router;