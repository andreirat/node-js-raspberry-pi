// BASE SETUP
// =============================================================================

// call the packages we need
var express    = require('express');
var bodyParser = require('body-parser');
var app        = express();
var morgan     = require('morgan');
var request    = require('request');	

// configure app
app.use(morgan('dev')); // log requests to the console

// configure body parser
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var port     = process.env.PORT || 8080; // set our port
var Bear     = require('./app/models/bear');

// ROUTES FOR OUR API
// =============================================================================

// create our router
var router = express.Router();

// middleware to use for all requests
router.use(function(req, res, next) {
	// do logging
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


// test route to make sure everything is working (accessed at GET http://localhost:8080/api)
router.get('/', function(req, res) {
	res.json({ message: 'hooray! welcome to our api!' });	
});

// on routes that end in /bears
// ----------------------------------------------------
router.route('/devices')

	.post(function(req, res) {
		var b = req.body.name;  // set the bears name (comes from the request)
	})

	// get all the bears (accessed at GET http://localhost:8080/api/bears)
	.get(function(req, res) {
		res.json({'message': 'hello','devices': testDevices});
	});


// get random joke
router.route('/jokes')
	// get the device with that name
	.get(function(req, res) {
			// var joke = getJoke(req.params.firstName, req.params.lastName);
		request('http://api.icndb.com/jokes/random/' ,
			function(error, response, body){
			var json_data = JSON.parse(body);
			res.json({'message': json_data.value.joke});
		});

	})


// on routes that end in /bears/:bear_id
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

	// update the bear with this id
	.put(function(req, res) {
		Bear.findById(req.params.bear_id, function(err, bear) {

			if (err)
				res.send(err);

			bear.name = req.body.name;
			bear.save(function(err) {
				if (err)
					res.send(err);

				res.json({ message: 'Bear updated!' });
			});

		});
	})

	// delete the bear with this id
	.delete(function(req, res) {
		Bear.remove({
			_id: req.params.bear_id
		}, function(err, bear) {
			if (err)
				res.send(err);

			res.json({ message: 'Successfully deleted' });
		});
	});


// REGISTER OUR ROUTES -------------------------------
app.use('/api', router);

// START THE SERVER
// =============================================================================
app.listen(port);
console.log('Magic happens on port ' + port);
