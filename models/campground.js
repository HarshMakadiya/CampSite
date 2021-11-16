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