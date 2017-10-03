
var fs = require('fs');

var arrMoves = [];

fs.readFile("ServoPos.inf", function (err, inText){
	if (err) {
		return console.log(err);
	}
	arrMoves = JSON.parse(inText);
	console.log("File read");
	console.log(arrMoves);
})
	.then(function() {return console.log(arrMoves)})
