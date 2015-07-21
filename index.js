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
		analyzeFiles(files);
	}
	);

function analyzeFiles(files) {

	var summaries = [];
	var logFormat = 'Average of %d seconds for %s';
	
	// get all the xhr entries and their wait times
	files.forEach(function (f, i) {
		var har = JSON.parse(f);
		var xhrs = getXhrsEntries(har);

		_.forEach(xhrs, function (xhr) {
			summaries.push({ url: xhr.request.url, wait: parseFloat(xhr.timings.wait) });
		})
	});
	
	// group the entries by url
	var groupedObject = _.groupBy(summaries, 'url');
	
	// I am creating an array here, because I need it to sort the results
	var groupedArray = [];
	
	// get the avg wait time for each url
	_.forOwn(groupedObject, function(value,key){
		var waitTime = _.sum(value, 'wait');
		waitTime = Math.floor(waitTime);
		var entriesCount = _.keys(groupedObject).length;
		groupedArray.push({url: key, avgWaitTime: Math.floor(waitTime/entriesCount)/1000});
	});
	
	// sort the results by highest average wait time
	var sorted = _.sortByOrder(groupedArray, 'avgWaitTime', 'desc');
	
	_.forEach(sorted, function(s){
		console.log(util.format(logFormat, s.avgWaitTime, s.url));
	});
}

// I want to get just the x-http-requests for data
// This is just a weak filter, until I find better one
function getXhrsEntries(har) {
	var entries = har.log.entries;
	var xhrs = _.filter(entries, { response: { content: { mimeType: 'application/json' } } });
	return xhrs;
}