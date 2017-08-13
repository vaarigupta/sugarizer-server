var jwt = require('jwt-simple');
var users = require('../controller/auth');
var config = require('../../config/secret.js')();

module.exports = function(req, res, next) {

	var token = (req.body && req.body.access_token) || (req.query && req.query.access_token) || req.headers['x-access-token'];
	var key = (req.body && req.body.x_key) || (req.query && req.query.x_key) || req.headers['x-key']; //key is unique _id of the user

	if (token && key) {

		try {
			var decoded = jwt.decode(token, config);

			if (decoded.exp <= Date.now()) {
				return res.status(400).send({
					"message": "Token Expired"
				});
			}

			// Authorize the user to see if s/he can access our resources
			// The key would be the logged in user's id
			users.validateUser(key, function(user) {
				if (user) {

					//store the user object in req
					req.user = user;

					//send to the next middleware
					next();
				} else {
					// No user with this name exists, respond back with a 401
					return res.status(401).send({
						"message": "Invalid User"
					});
				}
			});

		} catch (err) {
			return res.status(500).send({
				"message": "Oops something went wrong",
				"error": err
			});
		}
	} else {
		return res.status(401).send({
			"message": "Invalid Token or Key"
		});
	}
};