var async = require('async');
var fs = require('fs');
var util = require('util');
var _ = require('lodash');

// save HARs in data folder (e.g. "data/report1.json")
var files = fs.readdirSync('data');

// First I need to read all the files.
// Using async module to map every filename to it's content.
async.map(
// 1st parameter is the array of filenames.
	files,
	// 2nd parameter is the function that gets called on every filename
	// Here I need to read the actual file (append the data folder) and
	// wait for the result. Once the file is read, I'll just run the
	// provided callback function which will add the file to internal
	// files collection (I guess).
	function (name, callback) {
		fs.readFile('data/' + name, function (err, data) {
			// Enable this console output if you want to look like a pro hacker.
			// console.log(data.toString());
			callback(null, data);
		});
	},
	// 3rd parameter is the function that gets called once all the
	// files are loaded. This is the place where I can start working with data.
	function (err, files) {
		if (err)
			throw err;

		var summary = {};
		var logFormat = 'Waiting %d seconds for %s';

		files.forEach(function (f, i) {
			var har = JSON.parse(f);
			var entries = har.log.entries;
			
			// weak/simple way of filtering out the xhrs
			var xhrs = _.filter(entries, { response: { content: { mimeType: 'application/json' } } });
			
			// console.log(util.format('%d. HAR',i));
			_.forEach(_.sortByOrder(xhrs, 'timings.wait', 'desc'), function (item) {
				// saving to summary
				var newValue = Math.floor(parseFloat(item.timings.wait));
				summary[item.request.url] = summary[item.request.url] ? parseInt(summary[item.request.url], 10) : 0;
				summary[item.request.url] += newValue;
				// debug output
				// console.log(util.format(logFormat, (item.timings.wait/1000).toPrecision(2), item.request.url));
			});
		});
		
		// process summary
		console.log('Summary of average waiting times:');
		
		// TODO: orderby
		for (prop in summary) {
			var avg = summary[prop] / Object.getOwnPropertyNames(summary).length
			console.log(util.format(logFormat, (avg / 1000).toPrecision(3), prop));
		}
	}
	);