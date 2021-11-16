const express = require('express')
const router = express.Router({mergeParams: true});
const catchasync = require('../helpers/catchAsync')
const Campground = require('../models/campground')
const review = require('../models/review')
const ExpressError =  require('../helpers/Expresserror')
const {reviewSchema} = require('../schemas.js')
const reviews = require('../controllers/review')

const validatereview = (req,res,next) =>{
    
    const {error} =  reviewSchema.validate(req.body);
    if(error){
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400)
    }
    else{
        next();
    }
}
const isReviewAuthor = async(req,res,next)=>{
    const{id,reviewId} = req.params;
    const Review =  await review.findById(reviewId);
    if(!Review.author.equals(req.session.user_id)){
        req.flash('error', 'You cannot delete this review')
        return res.redirect(`/campgrounds/${id}`)
    }
    next();
}
const isLoggedIn = (req,res,next)=>{
    if(req.session.user_id == null){
        req.flash('error', 'You must LogIn to perform that action')
        return res.redirect('/login');
    }
    next();
}

router.post('/' , isLoggedIn,validatereview,catchasync(reviews.createReview))

router.delete('/:reviewId', isLoggedIn,isReviewAuthor,catchasync(reviews.deleteReview))

module.exports = router;