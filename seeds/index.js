const mongoose = require('mongoose')
const cities = require("./cities")
const {places, descriptors} = require("./seedhelpers")

const Campground = require('../models/campground')
// mongoose.connect('mongodb://localhost:27017/yelpcamp')
const Dburl = process.env.Db_url ||'mongodb://localhost:27017/yelpcamp';
mongoose.connect(Dburl)
const db = mongoose.connection;
db.on("error", console.error.bind(console, 'connection error'))
db.once("open",()=>{
    console.log("DATABASE CONNECTED!!!!!")
})
const date_ob = new Date();
const year = date_ob.getFullYear();
const date = ("0" + date_ob.getDate()).slice(-2);
const month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
const currentDate = `${date}-${month}-${year}`;
const sample = array=>array[Math.floor(Math.random()*array.length)];

const seedDb = async ()=>{
    await Campground.deleteMany({});
    for(let i=0; i<50; i++){
        const random1000 = Math.floor(Math.random()*1000);

        const price = Math.floor(Math.random()*1000) + 10;

        const camp = new Campground({
            author: '6193a55ad82cf40dd0245c47',
            location:`${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptors)},${sample(places)}`,
            description:"Lorem ipsum dolor sit amet, consectetur adipisicing elit. Ut odit voluptas dolorum. Veniam quae accusamus aperiam rem, consectetur minus aliquam ut! Repellat architecto excepturi commodi, assumenda numquam perspiciatis ipsam dolores.",
            price: price,
            images: [
                {
                    url: 'https://res.cloudinary.com/harshmakadiya/image/upload/v1636273949/Yelpcamp/nae2uuwfuyzgo33mir53.jpg',
                    filename: 'Yelpcamp/nae2uuwfuyzgo33mir53.jpg',
                  },
                  {
                    url: 'https://res.cloudinary.com/harshmakadiya/image/upload/v1636274560/Yelpcamp/wlzi6ka0v2teonsou1tg.jpg',
                    filename: 'Yelpcamp/wlzi6ka0v2teonsou1tg.jpg',
                  }
            ],
            geometry:{
                type:"Point",
                coordinates:[
                    cities[random1000].latitude, 
                    cities[random1000].longitude,
                ]
            },
            createdDate: currentDate
        })
        await camp.save();
    }
}
seedDb().then(()=>{
    mongoose.connection.close();
}).catch(err=>{
    console.log(err);
});