// BASE SETUP
// =============================================================================

// call the packages we need
var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var http = require('http').Server(app);
var morgan = require('morgan');
var request = require('request');
var io = require('socket.io')(http);
var five = require("johnny-five");
var Raspi = require("raspi-io");
var board = new five.Board({
    // Set board type
    io: new Raspi()
});

// Set port
var port = process.env.PORT || 8080;

// configure app
app.use(morgan('dev')); // log requests to the console
app.use(express.static(__dirname + '/public')); // set static folder
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.get('/', function(req, res) {
    res.sendFile(__dirname + '/public/index.html');
});

// ROUTES FOR OUR API
// =============================================================================

// create our router
var router = express.Router();

// middleware to use for all requests
router.use(function(req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', 'http://iot.dev');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    res.setHeader('Access-Control-Allow-Credentials', true);
    next();
});

var led;
var motion = {};
var alarm = false;
var greenLed = {};
var redLed = {};

// When board is ready ...
board.on("ready", function() {
    console.log(board.id);
    console.log("Board is ready");
    // test route to make sure everything is working (accessed at GET http://localhost:8080/api)
    router.get('/', function(req, res) {
        res.json({ message: 'hooray! welcome to our api!' });
    });

    var motion = new five.Motion("GPIO18");

    // "calibrated" occurs once, at the beginning of a session,
    motion.on("calibrated", function(data) {
        console.log("Calibrated");
    });

    // "motionstart" events are fired when the "calibrated"
    // proximal area is disrupted, generally by some form of movement
    motion.on("motionstart", function() {
        var date = new Date();
        console.log("motionstart");
	console.log(alarm);
    });

    // "motionend" events are fired following a "motionstart" event
    // when no movement has occurred in X ms
    motion.on("motionend", function() {
        var date = new Date;
        console.log("motionend");
    });


    router.route('/lights/:pin/:state/:token')
        .get(function(req, res) {
            var date = new Date();
            var pin = req.params.pin;
            var state = req.params.state;
            var token = req.params.token;
            led = new five.Led(pin);
            state == "on" ? led.on() : led.off();
            res.json({
                "state": state,
                "pin": pin,
                "board": board.id,
                'date': date
            });
        })

    router.route('/alarm/start/:pin/:token')
        .get(function(req, res) {
            var date = new Date();
            var pin = req.params.pin;
            var token = req.params.token;
            redLed = new five.Led(pin);
            redLed.blink(300);
            res.json({
                "pin": pin,
                "board": board.id,
                'date': date
            });
        })

    router.route('/alarm/stop/:pin1/:pin2/:token')
        .get(function(req, res) {
            var date = new Date();
            var pin1 = req.params.pin1;
	    var pin2 = req.params.pin2;
            var token = req.params.token;
	    greenLed = new five.Led(pin1);
	    redLed =  new five.Led(pin2);
            redLed.off();
	    greenLed.on();
            res.json({
                "pin": pin1,
                "board": board.id,
                'date': date
            });
        })

    router.route('/')

});

// Socket logic 
io.on('connection', function(socket) {

    console.info('New client connected (id=' + socket.id + ').');
});




// REGISTER OUR ROUTES -------------------------------
app.use('/api', router);

// START THE SERVER
// ======================================================
app.listen(port);
console.log('Magic happens on port ' + port);
