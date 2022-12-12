if(process.env.NODE_ENV != "production"){
    require('dotenv').config();
}
const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ExpressError =  require('./helpers/Expresserror')
const ejsMate = require('ejs-mate');
const JOI = require('joi')
const {campgroundSchema, reviewSchema} = require('./schemas.js')
const flash = require('connect-flash');
const session = require('express-session')
const review = require('./models/review')
const methodoverride = require("method-override")
const Campground = require('./models/campground')
const campgroundRoutes = require('./routes/campground')
const reviewRoutes = require('./routes/reviews')
const passport = require('passport');
const passportlocal = require('passport-local');
const User = require('./models/user');
const bcrypt = require('bcrypt')
const userRoute = require('./routes/users')
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet')
const MongoStore = require('connect-mongo')(session);


const Dburl = process.env.Db_url ||'mongodb://localhost:27017/yelpcamp';
mongoose.connect(Dburl)
const db = mongoose.connection;

db.on("error", console.error.bind(console, 'connection error'))
db.once("open",()=>{
    console.log("DATABASE CONNECTED!!!!!")
})
const app = express();
app.engine('ejs', ejsMate)
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))
app.use(express.urlencoded({extended: true}))
app.use(methodoverride('_method'))
app.use(express.static(path.join(__dirname, 'public')))
app.use(
    mongoSanitize({
      replaceWith: '_',
    }),
);
const secret = process.env.SECRET || 'thisshouldbeabetterasecret!'
const store = new MongoStore({
    url: Dburl,
    secret,
    touchAfter: 24 * 60 * 60
})
store.on("error", function(e){
    console.log("Session Store error");
});
const sessionConfig = {
    store,
    name: 'ThisIsYourCookieSession',
    secret,
    resave: false,
    saveUninitialized:true,
    cookie: {
        httpOnly: true,
        // secure: true,
        expires: Date.now() + 100060*60*24*7,
        maxAge : 1000*60*60*24*7
    }
}

app.use(session(sessionConfig))
app.use(flash())
app.use(helmet({
    contentSecurityPolicy: false,
  }));
app.use((req,res,next)=>{
    res.locals.currentUser = req.session.data
    res.locals.success=req.flash('success');
    res.locals.error = req.flash('error');
    next();
})



app.use('/campgrounds', campgroundRoutes);
app.use('/campgrounds/:id/reviews', reviewRoutes);
app.use('/', userRoute)

app.get('/' , (req , res)=>{

    res.render('home')
 
 })
app.get('/fakeuser' , async(req , res)=>{

    const user = new User({email: "harshharsh312@gmail.com", username:"harsh"})
    const newzuser = await User.register(user, 'up');
    res.send(newzuser)

})

app.all('*', (req,res,next)=>{
    next(new ExpressError('Page not found', 404))
})

app.use((err,req,res,next)=>{
    const {statuscode =  500} = err;
    if(!err.message) err.message = "OH NO! ANYWAY"
    res.status(statuscode).render('errorTemplete', {err});
})


const port = process.env.PORT || 3000
app.listen(port,()=>{
    console.log(`SERVING THE PORT ${port}`);
})
