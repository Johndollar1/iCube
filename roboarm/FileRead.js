
var fs = require('fs');

var inText = fs.readFileSync("ServoPos.inf");
console.log("File read");
var arrMovesSync = JSON.parse(inText);
console.log(arrMovesSync);

for (var i = 0; i < arrMovesSync.length ; i++) {

	let moves = arrMovesSync[i];

	console.log(moves);

	let servoMoves = [];
	for(let key in moves) {
		console.log(key, moves[key]);
		}
	}
