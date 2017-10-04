
var fs = require('fs');

const iInit = { '0': 347, '1': 214, '2': 97, '3': 593, '4': 140, '5': 573 };

const arrMoves = [iInit];

/*arrMoves.push({ '0': 347, '1': 402, '2': 402, '3': 395, '4': 400, '5': 573 });
arrMoves.push({ '0': 190, '1': 365, '2': 184, '3': 395, '4': 141, '5': 573 });
arrMoves.push({ '0': 190, '1': 365, '2': 184, '3': 395, '4': 141, '5': 573 });
arrMoves.push({ '0': 190, '1': 336, '2': 96, '3': 511, '4': 141, '5': 573 });
arrMoves.push({ '0': 190, '1': 327, '2': 136, '3': 496, '4': 141, '5': 573 });
arrMoves.push({ '0': 190, '1': 295, '2': 198, '3': 464, '4': 141, '5': 573 });
arrMoves.push({ '0': 190, '1': 295, '2': 198, '3': 464, '4': 141, '5': 615 });
arrMoves.push({ '0': 190, '1': 328, '2': 167, '3': 464, '4': 141, '5': 615 });
arrMoves.push({ '0': 265, '1': 328, '2': 167, '3': 464, '4': 141, '5': 615 });
*/

outText = JSON.stringify(arrMoves);

fs.writeFile("ServoPos.inf", outText, function(err) {
	if(err){
		return console.log(err);
	}
	console.log("File saved");
});
