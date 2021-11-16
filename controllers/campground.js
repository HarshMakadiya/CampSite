const Campground = require('../models/campground')
const {cloudinary} = require('../cloudinary/index')
const campground = require('../models/campground')
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geoCoder = mbxGeocoding({accessToken: mapBoxToken})

module.exports.index = async(req , res)=>{

    const campgrounds = await Campground.find({})
    res.render("campground/index", {campgrounds:campgrounds, auth: (req.session.user_id!=null)})
}
module.exports.renderNewForm = (req , res)=>{
    res.render("campground/new")
}
module.exports.createCampground = async (req , res, next)=>{
    const geoData = await geoCoder.forwardGeocode({
        query: req.body.campground.location,
        limit: 1
    }).send();
    const campground = new Campground(req.body.campground);
    campground.images = req.files.map(f=>({
        url: f.path,
        filename: f.filename
    }))
    const date_ob = new Date();
    const year = date_ob.getFullYear();
    const date = ("0" + date_ob.getDate()).slice(-2);   
    const month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
    const currentDate = `${date}-${month}-${year}`;
    campground.createdDate = currentDate;
    campground.geometry = geoData.body.features[0].geometry;
    campground.author = req.session.data;
    await campground.save();
    req.flash('success', 'Successfully made a new campground')
    res.redirect(`/campgrounds/${campground._id}`)
}

module.exports.showCampground = async (req , res)=>{
    const campgrounds  = await Campground.findById(req.params.id).populate({
        path:'reviews',
        populate:{
            path:'author'
        }
    }).populate('author');
    if(!campgrounds){
        req.flash('error', 'Cannot find that campground!')
        res.redirect('/campgrounds');
    }
    res.render("campground/show",{campgrounds})

}

module.exports.renderEditForm = async (req , res)=>{
    const campgrounds  = await Campground.findById(req.params.id)
    if(!campgrounds){
        req.flash('error', 'Cannot find that campground!')
        res.redirect('/campgrounds');
    }
    res.render("campground/edit",{campgrounds})
   
}
module.exports.updateCampgrounds = async (req , res)=>{
    const{id} = req.params;
    const campgroundId =  await Campground.findById(id);
    if(!campgroundId.author.equals(req.session.user_id)){
        req.flash('error', 'You do not own this campground')
        return res.redirect(`/campgrounds/${campgroundId._id}`)
    }
     const campground = await Campground.findByIdAndUpdate(id,{...req.body.campground})
     const images =  req.files.map(f=>({
        url: f.path,
        filename: f.filename
    }))
    campground.images.push(...images);
    await campground.save();
    if(req.body.deleteImages){
        for(let filename of req.body.deleteImages){
            await cloudinary.uploader.destroy(filename)
        }
        await campground.updateOne({
            $pull: {
                images: {
                    filename:{
                        $in: req.body.deleteImages
                    }
                }
            }
        })
    }
    req.flash('success', 'Successfully updated the campground')
    res.redirect(`/campgrounds/${campground._id}`)
}

module.exports.deleteCampground = async (req,res)=>{
    const{id} = req.params;
    const campgroundId =  await Campground.findById(id);
    if(!campgroundId.author.equals(req.session.user_id)){
        req.flash('error', 'You do not own this campground')
        return res.redirect(`/campgrounds/${campgroundId._id}`)
    }
    const camp = await Campground.findById(id);
    for(element of camp.images){
        await cloudinary.uploader.destroy(element.filename);
    };  
    await Campground.findByIdAndDelete(id);
    req.flash('success', 'Successfully deleted a campground')
    res.redirect('/campgrounds');
}