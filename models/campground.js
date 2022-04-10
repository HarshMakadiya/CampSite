const { ref } = require('joi');
const mongoose = require('mongoose');
const review = require('./review');
const Schema = mongoose.Schema;
const imageSchema =  new Schema ({
    url: String,
    filename: String
})

imageSchema.virtual('thumbnail').get(function(){
    return this.url.replace('/upload', '/upload/w_200');
})

const opts = { toJSON: { virtuals: true } };

const campgroundSchema = new Schema({
    title: String,
    images: [
        imageSchema
    ],
    geometry:{
        type:{
            type: String,
            enum: ['Point'],
            required: true
        },
        coordinates:{
            type: [Number],
            required: true
        }
    },
    createdDate : String,
    price:  Number,
    description: String,
    location: String,
    author:{
        type: Schema.Types.ObjectId,
        ref:'User'

    },
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: 'review'
        }
    ]
}, opts)
campgroundSchema.virtual('properties.PopUpMarkup').get(function(){
    return `<strong><a href="/campgrounds/${this._id}">${this.title}</a></strong><p>
     ${this.description.substring(0,25)}...   
    </p>`
})

campgroundSchema.post('findOneAndDelete', async (doc)=>{
    if(doc){
        await review.deleteMany({
            _id:{
                $in : doc.reviews
            }
        })
    }
})

module.exports = mongoose.model('campground', campgroundSchema);