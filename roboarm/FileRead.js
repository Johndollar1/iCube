
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

var arrMovesSync = fs.readFileSync("ServoPos.inf");
console.log("File read again");
console.log(arrMovesSync);
