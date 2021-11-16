const Campground = require('../models/campground')
const review = require('../models/review')
module.exports.createReview = async(req , res)=>{
    const campground=await Campground.findById(req.params.id);
    const Review = new review(req.body.review)
    Review.author = req.session.data;
    campground.reviews.push(Review);
    await Review.save();
    await campground.save()
    req.flash('success', 'Successfully created a review')
    res.redirect(`/campgrounds/${campground._id}`)
}

module.exports.deleteReview = async(req,res)=>{
    const {id, reviewId} = req.params;
    await Campground.findByIdAndUpdate(id,{$pull: {reviews: reviewId}});
    await review.findByIdAndDelete(reviewId);
    req.flash('success', 'Successfully deleted a review')
    res.redirect(`/campgrounds/${id}`)
}