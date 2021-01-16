const express = require("express"),
    router = express.Router();
const User = require('../models/User');
const Link = require('../models/Link');
const bcrypt = require('bcrypt');
const checkAuth = require('./auth.js');
const   mongoose = require("mongoose");


router.get('/home/user', (req, res) => {
    res.send('working');
});

router.get('/user/signup', (req, res) => {
    res.render('signup');
});
router.get('/user/dashboard', checkAuth, (req, res) => {
    Link.find({ author: req.cookies.id }).then(link => {
        res.render('admin', {name: req.cookies.name, email: req.cookies.email, link: link });
    });
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
                    res.cookie("name", fetchedUser.name);
                    res.cookie("email", fetchedUser.email);
                    res.cookie("password", fetchedUser.password);
                    res.cookie("id", fetchedUser._id);
                    res.redirect('/user/dashboard');
                }
            }
        ).catch(err => {
            console.log(err);
        })
    };
});

router.post('/createLink', checkAuth, (req, res, next) => {
    let Expire;
    let userID = req.cookies.id;
    if (req.body.expire) {
        Expire = req.body.expire;
    } else {
        Expire = undefined;
    }
    const link = new Link({
        shortURL: req.body.shortURL,
        originalURL: req.body.originalURL,
        expireAt: Expire,
        author: userID
    });
    link.save().then(link => {
        res.redirect('/user/dashboard');
    }).catch(err => res.message({ err }));
});

router.get('/:data', (req, res) => {
    let data = req.params.data;
    Link.findOne({ shortURL: data }).then(link => {
        if (link) {
            res.redirect(link.originalURL);
        }
    })
});

router.post('/updateLink', checkAuth, (req, res) => {
    let Expire;
    let linkID = mongoose.Schema.ObjectId(req.body.id);
    if (req.body.expire) {
        Expire = req.body.expire;
    } else {
        Expire = undefined;
    }

    Link.findOneAndUpdate({ _id: req.body.id }, {
        shortURL: req.body.shortURL,
        originalURL: req.body.originalURL,
        expireAt: Expire
    }).then(link => {
        res.redirect('/user/dashboard');
    });
});

router.post('/deleteLink', (req, res) => {
    id = req.body.linkid;
    Link.findByIdAndDelete(id).then(link => { 
        res.redirect('/user/dashboard');
    })
});
module.exports = router;