const express=require('express');
const path=require('path');
const mongoose=require('mongoose');
const bodyParser=require('body-parser');
const session=require('express-session');
const passport=require('passport');
const config=require('./config/database');

mongoose.connect(config.database,{useNewUrlParser:true},function(err){
    if(err){
        console.log('Connection Error:'+err);
    }else{
        console.log('Connection success!')
    }
});
let db=mongoose.connection;

db.once('open', function(){
    console.log('Connected to Mongodb');
})

db.on('error', function(err){
    console.log(err);
})

let Article=require('./models/article');

const app=express();

app.use(session({
    secret: 'config.secret',
    resave: false,
    saveUninitialized: true
    // cookie: { secure: true }
}));

app.use(require('connect-flash')());
app.use(function (req, res, next) {
  res.locals.messages = require('express-messages')(req, res);
  next();
});

app.use(bodyParser.urlencoded({ extended:false }));

app.use(express.static(path.join(__dirname, 'public')));

require('./config/passport')(passport);
app.use(passport.initialize());
app.use(passport.session());

app.get('*', function(req, res, next){
    res.locals.user=req.user || null;
    next();
})

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

let articles=require('./routes/articles');
let users=require('./routes/users');

app.use('/articles', articles);
app.use('/users', users);


app.get('/', function(req, res){
    Article.find({},function(err,articles){
        res.render('articles/index', {
            articles:articles
        })
    });
});

app.listen(5000, function(){
    console.log('Server started on port 5000...');
});