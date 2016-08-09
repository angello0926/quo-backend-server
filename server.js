var express     = require('express');
var app         = express();
var bodyParser  = require('body-parser');
var morgan      = require('morgan');
var mongoose    = require('mongoose');
var passport  = require('passport');
var config      = require('./config/database'); // get db config file
var User        = require('./app/models/user'); // get the mongoose model
var port        = process.env.PORT || 8080;

const authController = require('./controllers/auth');
const postController = require('./controllers/post');


// get our request parameters
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));
app.use(bodyParser.json({limit: '50mb'}));

// log to console
app.use(morgan('dev'));

// Use the passport package in our application
app.use(passport.initialize());

// demo Route (GET http://localhost:8080)
app.get('/', function(req, res) {
  res.send('Hello! The API is at http://localhost:' + port + '/api');
});

// Start the server
app.listen(port);
console.log('There will be dragons: http://localhost:' + port);

mongoose.connect(config.database);

// pass passport for configuration
require('./config/passport')(passport);

// bundle our routes
var apiRoutes = express.Router();

// create a new user account (POST http://localhost:8080/api/signup)

apiRoutes.post('/signup', authController.signup);

//routes for login
apiRoutes.post('/authenticate', authController.authenticate);


// route to a restricted info (GET http://localhost:8080/api/memberinfo)
apiRoutes.get('/memberinfo', passport.authenticate('jwt', { session: false}), authController.memberinfo);

//Routes for creating posts
apiRoutes.post('/imageupload', passport.authenticate('jwt', { session: false}),postController.imageupload);
apiRoutes.post('/submit', passport.authenticate('jwt', { session: false}),postController.submission);

//routes for get home posts
apiRoutes.get('/getallposts', passport.authenticate('jwt', { session: false}), postController.getAllFeeds);
apiRoutes.get('/posts/:img', passport.authenticate('jwt', { session: false}), postController.getOnePost);
apiRoutes.get('/getuserposts', passport.authenticate('jwt', { session: false}), postController.getReqUserPosts);
apiRoutes.delete('/delete/:name', passport.authenticate('jwt', { session: false}), postController.deletePost);


// connect the api routes under /api/*
app.use('/api', apiRoutes);