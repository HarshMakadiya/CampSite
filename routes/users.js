const User = require('../models/user')
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const catchAsync = require('../helpers/catchAsync');
const passport = require('passport');
const passportlocal = require('passport-local');
const users = require('../controllers/user')

router.get('/register', users.renderRegister)

router.post('/register', catchAsync(users.register))

router.get('/login' ,users.renderLogin)

router.post('/login' , users.logIn)

router.get('/logout' , users.logOut)

// var check = (obj)=>{
//     return new Promise((resolve,reject)=>{
//         db.collection('users').findOne(obj,(err,res)=>{
//             if(err) reject(err);
//             resolve((res==null));
//         })
//     })
// }
// router.post('/check',(req,res)=>{
//     query[req.body.key] = req.body.value;
//     check(query).then((re)=>{
//         res.send(re);
//         res.end();
//     }).catch((err)=>{
//         res.send(err);
//         res.end();
//     })
// })

module.exports = router