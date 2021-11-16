const User = require('../models/user')
const bcrypt = require('bcrypt');
module.exports.renderRegister = (req,res)=>{
    res.render('users/register');
}

module.exports.register = async(req,res,next)=>{
    const exp = new RegExp("^(?=.*[!@#$%^&*])(?=.*[0-9])[a-zA-Z0-9!@#$%^&*]{8,16}$");
    const passpass = req.body.password;
    if(exp.test(passpass)==false){
        req.flash('error', "Password requirement doesn't meet")
        res.redirect('/register')
    }
    else{
        try{
            const {password, username, email} = req.body
            const hash = await bcrypt.hash(password, 12);
            const user = new User({
                username,
                email,
                password: hash
            })
            await user.save();    
            req.session.user_id = user._id;
            req.session.data = user;
            req.flash('success', 'Successfully Registered')
            res.redirect('/campgrounds');
        }
        catch(e){
            const op = e.keyPattern;
            var str = '';
            if(op.email!=null){str+='Email'};
            if(op.username!=null){str+='Username'};
            req.flash('error', `${str} already exist`)
            res.redirect('/register')
        }
    }
}

module.exports.renderLogin = (req,res)=>{
    
    if(req.session.user_id != null){
        res.redirect('/campgrounds');
    }
    else{
        res.render('users/login')
    }
}

module.exports.logIn = async(req , res)=>{
    const {password, username} = req.body;
    const foundUser = await User.findAndValidate(username, password);
    if(foundUser){
        req.session.user_id = foundUser._id;
        req.session.data = foundUser;
        const redirectedUrl = req.session.returnTo || '/campgrounds';
        req.flash('success', 'Successfully logged in')
        delete req.session.returnTo;
        res.redirect(redirectedUrl);
    }
    else{
        req.flash('error', 'Wrong credentials')
        res.redirect('/login');
    } 
}

module.exports.logOut = (req , res)=>{
    req.session.destroy();
    res.redirect('/campgrounds');
    
}