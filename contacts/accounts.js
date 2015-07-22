var express = require('express'),
    bodyParser = require('body-parser'),
    session = require('express-session'),
    Bourne = require('bourne'),
    crypto = require('crypto');

var router = express.Router(),
    db = new Bourne('users.json');

function hash(password){
    return crypto.createHash('sha256').update(password).digest('hex');
}

router
    .use(bodyParser.urlencoded())
    .use(bodyParser.json())
    .use(session({ secret: 'hfjejhffjhaf3jezhjehfzaj81hfkjezajzfh54lkjefkajezhf' }))
    .get('/login', function(req,res){ // si l'utilisateur n'est pas logge
        res.sendfile('public/login.html');
    })
    .post('/login', function(req,res){ // si l'utilisateur renseigne son username et son password et appuie sur login
        var user = {
            username: req.body.username,
            password: hash(req.body.password)
        };

        db.findOne(user, function(err,data){
            if (err) throw err;
            if(data){
                req.session.userId = data.id;
                res.redirect('/');
            } else {
                res.redirect('/login');
            }
        });
    })
    .post('/register', function(req,res){ // si c'est la premiere visite de l'utilisateur et qu'il n'a pas encore de compte, lorsqu'il appuie sur le bouton Sign Up
        var user = {
            username: req.body.username,
            password: hash(req.body.password),
            options: {}
        };

        db.find({ username: user.username }, function(err,data){ // on verifie que le username n'existe pas deja dans la bdd
            if (err) throw err;
            if(!data.length){
                db.insert(user, function(err,data){
                    if (err) throw err;
                    req.session.userId = data.id;
                    res.redirect('/');
                });
            } else {
                res.redirect('/login');
            }
        });
    })
    .get('/logout', function(req,res){ // lorsque l'utilisateur se deconnecte
        req.session.userId = null;
        res.redirect('/');
    })
    .use(function(req,res,next){
        if(req.session.userId){
            db.findOne({ id: req.session.userId }, function(err,data){
                if (err) throw err;
                req.user = data;
            });
        }
        next();
    });

module.exports = router;