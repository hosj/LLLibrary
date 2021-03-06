var express = require('express');
var passport = require('passport');
var User = require('../models/user');
var router = express.Router();


router.get('/', function (req, res) {
    res.render('index', { user : req.user });
});

router.get('/register', function(req, res) {
    res.render('register', { username: "",email:""});
});

router.post('/register', function(req, res) {
    User.register(new User({
      username: req.body.username,
      email: req.body.email
    }), req.body.password, function(err, user) {
        if (err) {
            return res.render("register", {info: "Sorry. That username already exists. Try again.",username:req.body.username,email:req.body.email});
        }

        passport.authenticate('local')(req, res, function () {
            res.redirect('/');
        });
    });
});

router.get('/login', function(req, res) {
    res.render('login', { user : req.user });
});

router.post('/login', passport.authenticate('local'), function(req, res) {
    res.redirect('/');
});

router.get('/logout', function(req, res) {
    req.logout();
    res.redirect('/');
});

router.get('/ping', function(req, res){
    //res.status(200).send("pong!");
    res.render('index');
});

module.exports = router;
