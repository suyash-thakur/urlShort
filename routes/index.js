const express = require("express"),
    router = express.Router();
const User = require('../models/User');
const Link = require('../models/Link');
const Click = require('../models/Click');
const bcrypt = require('bcryptjs');
const checkAuth = require('./auth.js');
const   mongoose = require("mongoose");
const moment = require('moment-timezone');
var generatePassword = require("password-generator");
var rug = require('random-username-generator');

router.get('/home/user', (req, res) => {
    res.send('working');
});
router.get('/home/about', (req, res) => {
    res.render('about');
});
router.get('/user/about', checkAuth, (req, res) => {
    res.render('aboutlogin');
});
router.get('/user/signup', (req, res) => {
    res.render('signup');
});
router.get('/user/use', (req, res) => {
    res.render('use');
});
router.get('/home/use', (req, res) => {
    res.render('useLogin');
});
router.get('/user/contact', (req, res) => {
    res.render('contact');
});
router.get('/home/contact', (req, res) => {
    res.render('contactLogin');
});
router.get('/user/dashboard/oldest', checkAuth, (req, res) => { 
    var errorString;
    var successString;
    if (req.query.error == 'ERRDP01') { 
        errorString = "Short URL name already taken";
    } else if (req.query.error == 'ERRDP02') {
        errorString = "Error Creating link";

     } else if (req.query.error == 'ERRDT') {
        errorString = "Invalid Date Selected";

     } else {
        errorString = undefined;
    }
    if (req.query.success == 'LNKCR01') { 
        successString = "Link Created";
    } else if (req.query.success == 'LNKUP01') {
        successString = "Link Updated";

     } else if (req.query.success == 'LNKDR01') {
        successString = "Link Deleted";

     } else {
        successString = undefined;
    }
    Link.find({ author: req.cookies.id }).then(link => {
        res.render('admin', {name: req.cookies.name, email: req.cookies.email, link: link, moment: moment, error: errorString, msg:successString });
    });
});
router.get('/user/dashboard/clicks', checkAuth, (req, res) => { 
    var errorString;
    var successString;
    if (req.query.error == 'ERRDP01') { 
        errorString = "Short URL name already taken";
    } else if (req.query.error == 'ERRDP02') {
        errorString = "Error Creating link";

     } else if (req.query.error == 'ERRDT') {
        errorString = "Invalid Date Selected";

     } else {
        errorString = undefined;
    }
    if (req.query.success == 'LNKCR01') { 
        successString = "Link Created";
    } else if (req.query.success == 'LNKUP01') {
        successString = "Link Updated";

     } else if (req.query.success == 'LNKDR01') {
        successString = "Link Deleted";

     } else {
        successString = undefined;
    }
    Link.find({ author: req.cookies.id }).then(link => {
        link.sort(function (a, b) {
            return parseInt(a.clicks) - parseInt(b.clicks);
        });
        link.reverse();
        res.render('admin', {name: req.cookies.name, email: req.cookies.email, link: link, moment: moment, error: errorString, msg:successString });
    });
});
router.post('/user/dashboard/search', checkAuth, (req, res) => { 
    var errorString;
    var successString;
    if (req.query.error == 'ERRDP01') { 
        errorString = "Short URL name already taken";
    } else if (req.query.error == 'ERRDP02') {
        errorString = "Error Creating link";

     } else if (req.query.error == 'ERRDT') {
        errorString = "Invalid Date Selected";

     } else {
        errorString = undefined;
    }
    if (req.query.success == 'LNKCR01') { 
        successString = "Link Created";
    } else if (req.query.success == 'LNKUP01') {
        successString = "Link Updated";

     } else if (req.query.success == 'LNKDR01') {
        successString = "Link Deleted";

     } else {
        successString = undefined;
    }
    if (req.body.search === undefined) {
        res.redirect('/user/dashboard')
    } else { 
        Link.find({ author: req.cookies.id }).then(links => {
            let search = req.body.search;
            let matches = [];
            for (var i = 0; i < links.length; i++) { 
                if (links[i].shortURL.includes(search) || links[i].originalURL.includes(search)) { 
                    matches.push(links[i]);
                }
            }
            res.render('admin', {name: req.cookies.name, email: req.cookies.email, link: matches, moment: moment, error: errorString, msg:successString, search: search});
        });
    }

});
router.get('/user/dashboard', checkAuth, (req, res) => { 
    var errorString;
    var successString;
    if (req.query.error == 'ERRDP01') { 
        errorString = "Short URL name already taken";
    } else if (req.query.error == 'ERRDP02') {
        errorString = "Error Creating link";

     } else if (req.query.error == 'ERRDT') {
        errorString = "Invalid Date Selected";

     } else {
        errorString = undefined;
    }
    if (req.query.success == 'LNKCR01') { 
        successString = "Link Created";
    } else if (req.query.success == 'LNKUP01') {
        successString = "Link Updated";

     } else if (req.query.success == 'LNKDR01') {
        successString = "Link Deleted";

     } else {
        successString = undefined;
    }
    Link.find({ author: req.cookies.id }).then(link => {
        link = link.reverse();
        res.render('admin', {name: req.cookies.name, email: req.cookies.email, guest: req.cookies.guest, link: link, moment: moment, error: errorString, msg:successString });
    });
});
router.get('/user/login', (req, res) => {
    res.render('login');
});
router.post('/user/signup', (req, res, next) => { 
    if (req.body.password !== req.body.confpassword) {
        res.render('signup', { error2: 'Passwords are not same' });
    } else {
        bcrypt.hash(req.body.password, 10).then(hash => {
            const user = new User({
                name: req.body.name,
                email: req.body.email,
                password: hash,
                isGuest: false
            });
            user.save().then(
                result => {
                    if (result) {
                        res.render('signup', { msg: 'User created. Login to continue' });
                    }
                }
            ).catch(err => {
                if (err.code && err.code == 11000) {
                    res.render('signup', { error2: 'Account with this email-Id already found' });
                } else { 
                    res.render('signup', { error2: 'Error Signing Up' });
                }
            });
        });
    }
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
                    res.cookie("guest", fetchedUser.isGuest);
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

    var isTimevalid = true;
    console.log(req.body.expire);
   
    if (req.body.expire) {
        var epoch = moment(req.body.expire).valueOf() - 19800000;
        let userID = req.cookies.id;
        let UTCDate = moment().utc(epoch).format();
        console.log(epoch);
        Expire = moment(req.body.expire).tz('Asia/Kolkata').toDate();
        console.log(Expire);

        if (epoch + 19800000 <= Date.now()) { 
            isTimevalid = false;
            res.redirect('/user/dashboard/?error=ERRDT');
            
        }
    } else {
        Expire = undefined;
    }
    if (isTimevalid === true) { 

    const link = new Link({
        shortURL: req.body.shortURL,
        originalURL: req.body.originalURL,
        expireAt: epoch,
        author: req.cookies.id
    });
    link.save().then(link => {
        res.redirect('/user/dashboard/?success=LNKCR01');
    }).catch(err => { 
        if (err.code && err.code == 11000) {
            res.redirect('/user/dashboard/?error=ERRDP01');

        } else { 
            res.redirect('/user/dashboard/?error=ERRDP02');

        }
    });
}

});

router.get('/', (req, res) => {
    res.render('about');
});

router.post('/googleSignin', async (req, res) => {
    const { email, password } = req.body;
    var user = await User.find({ email: req.body.email });
    if (user.length <= 0) {
        
        bcrypt.hash(req.body.password, 10).then(hash => {
            const user = new User({
                name: req.body.name,
                email: req.body.email,
                password: hash
            });
            user.save().then(
                result => {
                    if (result) {
                        User.findOne({ email: email }).then(user => {
                            if (user) {
                                fetchedUser = user;
                                return bcrypt.compare(req.body.password, user.password);
                            }
                        }).then(
                            result => {
                                if (!result) {
                                    res.render('login', { error: "Email Id already used" });
                                } else {
                                    res.cookie("name", fetchedUser.name);
                                    res.cookie("email", fetchedUser.email);
                                    res.cookie("password", fetchedUser.password);
                                    res.cookie("id", fetchedUser._id);
                                    res.cookie("guest", fetchedUser.isGuest);
                                    res.redirect('/user/dashboard');
                                }
                            }
                        ).catch(err => {
                            console.log(err);
                        });
                    }
                }
            ).catch(err => {
                if (err.code && err.code == 11000) {
                    res.render('signup', { error2: 'Account with this email-Id already found' });
                } else { 
                    res.render('signup', { error2: 'Error Signing Up' });
                }
            });
        });
    } else if (user.length > 0) {
        User.findOne({ email: email }).then(user => {
            if (user) {
                fetchedUser = user;
                return bcrypt.compare(req.body.password, user.password);
            }
        }).then(
            result => {
                if (!result) {
                    res.render('login', { error: "Account with this email-Id already found" });
                } else {
                    res.cookie("name", fetchedUser.name);
                    res.cookie("email", fetchedUser.email);
                    res.cookie("password", fetchedUser.password);
                    res.cookie("id", fetchedUser._id);
                    res.cookie("guest", fetchedUser.isGuest);

                    res.redirect('/user/dashboard');
                }
            }
        ).catch(err => {
            console.log(err);
        });
    }
});
router.get('/:data', (req, res) => {
    let data = req.params.data;
    Link.findOneAndUpdate({ shortURL: data }, {$inc : {clicks : 1}}, 
    {new: true}, ).then(link => {
        if (link) {
            var click = new Click({
                linkId: link._id
            });
            click.save();
            res.redirect(link.originalURL);
        }
    })
});
router.get('/:data/:data2', (req, res) => {
    let data = req.params.data + "/" + req.params.data2;
    console.log(data);
    Link.findOneAndUpdate({ shortURL: data }, {$inc : {clicks : 1}}, 
    {new: true}, ).then(link => {
        if (link) {
            var click = new Click({
                linkId: link._id
            });
            click.save();
            res.redirect(link.originalURL);
        }
    })
});

router.get('/:data/:data2/:data3', (req, res) => {
    let data = req.params.data + "/" + req.params.data2 + "/" + req.params.data3;
    Link.findOneAndUpdate({ shortURL: data }, {$inc : {clicks : 1}}, 
    {new: true}, ).then(link => {
        if (link) {
            var click = new Click({
                linkId: link._id
            });
            click.save();
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
        res.redirect('/user/dashboard?success=LNKUP01');
    });
});

router.post('/deleteLink', (req, res) => {
    id = req.body.linkid;
    Link.findByIdAndDelete(id).then(link => { 
        res.redirect('/user/dashboard?success=LNKDR01');
    })
});

router.post('/guestLogin', (req, res) => {
    var userName = rug.generate();
    var passWord = generatePassword();
    bcrypt.hash(passWord, 10).then(hash => {
        const user = new User({
            name: 'Guest User',
            email: userName,
            password: hash,
            isGuest: true
        });
        user.save().then(
            result => {
                res.cookie("name", result.name);
                res.cookie("email", result.email);
                res.cookie("password", result.password);
                res.cookie("id", result._id);
                res.cookie("guest", result.isGuest);

                res.redirect('/user/dashboard');
            }
        )
    });
});
module.exports = router;