const User = require('../models/User');

module.exports = (req, res, next) => {
  try {
    if (Object.keys(req.cookies).length !== 0 && req.cookies.email != undefined) {
        const email = req.cookies.email;
        console.log(email);
                User.findOne({ email: email }).then(User => {
                    if (!User) { 
                        res.render('login');
                    } else {

                        next();
                    }
                 })
            } else {
                res.render('login');
            }
  } catch (error) {
    res.render('login');
  }
};
