const express=require('express')
const app=express()
const mongoose=require('mongoose')
const session=require('express-session')
const passportlocalmongoo=require('passport-local-mongoose')
const seed=require("./seed.js")
const methodOverride=require('method-override')
const path=require('path')
const Engine = require('ejs-mate')
const passport=require('passport')
const localpa=require('passport-local')


app.engine('ejs', Engine);
app.set("view engine","ejs")
app.use(express.static(path.join(__dirname, 'public')))
app.use(express.urlencoded({extended:true}))
app.use(express.json());
app.use(methodOverride('_method'))
app.set('views', path.join(__dirname, 'views'));
 app.use(session({
   secret: 'thisismybekarwalkey',
   resave: false,
   saveUninitialized: true,
   
 }))
 app.use(passport.initialize());
app.use(passport.session());
passport.use(new localpa.Strategy(usermodel.authenticate()));

passport.serializeUser(usermodel.serializeUser());
passport.deserializeUser(usermodel.deserializeUser());

mongoose.connect('mongodb://127.0.0.1:27017/shoppingcart')
.then(()=>{
    console.log("Connected to MongoDB")
})






app.listen(3000,()=>{
    console.log("server running")
})