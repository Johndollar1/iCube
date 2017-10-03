
var fs = require('fs');

const iInit = { '0': 347, '1': 214, '2': 97, '3': 593, '4': 140, '5': 573 };

const arrMoves = [iInit];

arrMoves.push ({ '0': 348, '1': 215, '2': 98, '3': 594, '4': 141, '5': 574 });

arrMoves.push ({ '0': 349, '1': 216, '2': 99, '3': 595, '4': 142, '5': 575 });

arrMoves.push({ '0': 350, '1': 217, '2': 100, '3': 596, '4': 143, '5': 576 });

outText = JSON.stringify(arrMoves);

fs.writeFile("ServoPos.inf", outText, function(err) {
	if(err){
		return console.log(err);
	}
	console.log("File saved");
});
