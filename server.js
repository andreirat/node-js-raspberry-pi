// BASE SETUP
// =============================================================================

// call the packages we need
var express    = require('express');
var bodyParser = require('body-parser');
var app        = express();
var http 	   = require('http').Server(app);
var morgan     = require('morgan');
var request    = require('request');
var io         = require('socket.io')(http);
var five 	   = require("johnny-five");
// var Raspi 	   = require("raspi-io");
var board 	   = new five.Board({
//   io: new Raspi()
});
var port       = process.env.PORT || 8080; // set our port

// configure app
app.use(morgan('dev')); // log requests to the console
app.use(express.static(__dirname + '/public'));// set static folder
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
	console.log('Something is happening.');
	next();
});

var testDevices = [{
		'name': 'light1',
		'id': '123123',
		'status': 'off',
	},{
		'name': 'switch',
		'id': '1232',
		'status': 'on'
	}
]

var light = {
	'name': 'bec',
	'id': "123313123"
}

// When board is ready ...
board.on("ready", function() {
  var led = new five.Led("P1-13");
  led.blink();
});

// Socket logic 
io.on('connection', function (socket) {

    console.info('New client connected (id=' + socket.id + ').');
});

// test route to make sure everything is working (accessed at GET http://localhost:8080/api)
router.get('/', function(req, res) {
	res.json({ message: 'hooray! welcome to our api!' });	
});

// ----------------------------------------------------
router.route('/devices')

	.post(function(req, res) {
		var b = req.body.name;  
	})

	// get all the devices (accessed at GET http://localhost:8080/api/devices)
	.get(function(req, res) {
		res.json({'message': 'hello','devices': testDevices});
	});


// get random joke
router.route('/jokes')
	.get(function(req, res) {
		request('http://api.icndb.com/jokes/random/' ,
			function(error, response, body){
			var json_data = JSON.parse(body);
			res.json({'message': json_data.value.joke});
		});

	})


// ----------------------------------------------------
router.route('/devices/:name')

	// get the device with that name
	.get(function(req, res) {
		var response = '';
		var date  = new Date();
		testDevices.forEach(function (dev) {
			if(dev.name === req.params.name){
				 response = dev;
			}else{
				response = 'Not found';
					}
		});
			res.json({'message': response, 'date': date});

	})

	// update the device with this id
	.put(function(req, res) {
		
	})

	// delete the device with this id
	.delete(function(req, res) {
		
	});


// REGISTER OUR ROUTES -------------------------------
app.use('/api', router);

// START THE SERVER
// ======================================================
app.listen(port);
console.log('Magic happens on port ' + port);
