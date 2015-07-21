var async = require('async');
var fs = require('fs');
var files = fs.readdirSync('data');

// read the files
// files.forEach(function(filename){
// 	console.log(filename);
// });

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
	function(name,callback){
		fs.readFile('data/'+name, function(err,data){
			// Enable this console output if you want to look like a pro hacker.
			// console.log(data.toString());
			callback(null,data);
		});
	},
	// 3rd parameter is the function that gets called once all the
	// files are loaded. This is the place where I can start working with data.
	function(err,files){
		if (err)
			throw err;
		files.forEach(function(f){
			console.log(f);
	});
});

console.log('done');