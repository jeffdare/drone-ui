var express = require('express');
var Cloudant = require('cloudant');
var router = express.Router();



var cloudantConfig = {
  user : "2f5922e8-30f1-4afd-a3b5-45e076b9d948-bluemix",
  password : "f517ae3b84bc2ab3ea98b71ae7ec487678439df39da6e0f18dc2509a90f64d72"
}
if(process.env.VCAP_SERVICES) {
	var env = JSON.parse(process.env.VCAP_SERVICES);
	if(env['cloudantNoSQLDB']){
		cloudantConfig = {
		  user : env['cloudantNoSQLDB'][0].credentials.username,
		  password : env['cloudantNoSQLDB'][0].credentials.password
		}
	}
}
// Initialize the library with my account.
var cloudant = Cloudant({account:cloudantConfig.user, password:cloudantConfig.password});
var droneDB = cloudant.db.use('drone');

/* GET users listing. */
router.get('/', function(req, res, next) {

	/*droneDB.get('04ffbc2b57f45b19bf104568b101a0b8', function (err, body) {
		if(!err){
			res.append("Content-Type",'image/png');
			res.send(new Buffer(body.payload));
		}
	});*/

	droneDB.list({'limit' : 1, 'descending' : true, 'include_docs' : true},function(err, body) {
	  if (!err) {
	    body.rows.forEach(function(doc) {
	      var pict = Buffer(doc.doc.payload);
	      res.append("Content-Type",'image/png');
		  res.send(pict);
	    });
	  }
	});

});

module.exports = router;
