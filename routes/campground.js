const express = require('express')
const router = express.Router();
const catchasync = require('../helpers/catchAsync')
const ExpressError =  require('../helpers/Expresserror')
const review = require('../models/review')
const Campground = require('../models/campground')
const {campgroundSchema} = require('../schemas.js')
const flash = require('connect-flash');
const campgrounds = require('../controllers/campground')
const multer  = require('multer')
const {storage} = require('../cloudinary/index')
const upload = multer({storage} )
const fs = require('fs');
const { response } = require('express');
const { session } = require('passport');
const campground = require('../models/campground');


const isLoggedIn = (req,res,next)=>{
    if(req.session.user_id == null){
        req.session.returnTo = req.originalUrl
        req.flash('error', 'You must LogIn to perform that action')
        return res.redirect('/login');
    }
    next();
}

const isAuthor = async(req,res,next)=>{
    const{id} = req.params;
    const campgroundId =  await Campground.findById(id);
    if(!campgroundId.author.equals(req.session.user_id)){
        req.flash('error', 'You do not own this campground')
        return res.redirect(`/campgrounds/${id}`)
    }
    next();
}

const validatecampground = (req,res,next) =>{
    
    const {error} =  campgroundSchema.validate(req.body);
    if(error){
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400)
    }
    else{
        next();
    }
}



router.get('/' , catchasync (campgrounds.index))

router.get('/new',isLoggedIn,campgrounds.renderNewForm)

router.post('/' ,isLoggedIn,upload.array('image'),validatecampground ,catchasync (campgrounds.createCampground))

router.get('/:id' , catchasync (campgrounds.showCampground))

router.get('/:id/edit',isLoggedIn,isAuthor,catchasync (campgrounds.renderEditForm))

router.put('/:id' , isLoggedIn,isAuthor,upload.array('image'),validatecampground,catchasync (campgrounds.updateCampgrounds))

router.delete('/:id', isLoggedIn,isAuthor,catchasync (campgrounds.deleteCampground))

module.exports = router;