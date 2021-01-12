const express = require("express"),
    router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcrypt');
const checkAuth = require('./auth.js');

router.get('/home/user', (req, res) => {
    res.send('working');
});

router.get('/:data', (req, res) => {
    let data = req.params.data;
    res.send(data);
});

router.get('/user/signup', (req, res) => {
    res.render('signup');
});
router.get('/user/dashboard', checkAuth, (req, res) => {
    res.render('admin');
});
router.get('/user/login', (req, res) => {
    res.render('login');
});
router.post('/user/signup', (req, res, next) => { 
    bcrypt.hash(req.body.password, 10).then(hash => {
        const user = new User({
            name: req.body.name,
            email: req.body.email,
            password: hash
        });
        user.save().then(
            result => {
                if (result) {
                    res.render('signup', { msg: 'User created. Login to continue' });
                }
            }
        ).catch(err => {
            console.log(err);
            res.render('signup', { error2: 'Error Signing Up' });
        });
    });
});

router.post('/login', (req, res, next) => {
    let fetchedUser;
    const { email, password } = req.body;
    if (email && password) {
        User.findOne({ email: email }).then(user => {
            if (user) {
                 fetchedUser = user;
                return bcrypt.compare(req.body.password, user.password);
            }
        }).then(
            result => {
                if (!result) {
                    res.render('login', { error: "Incorrect email and/or Password!" });
                } else { 
                    res.cookie("email", fetchedUser.email);
                    res.cookie("password", fetchedUser.password);
                    res.redirect('/user/dashboard');
                }
            }
        ).catch(err => {
            console.log(err);
        })
    };
});


module.exports = router;