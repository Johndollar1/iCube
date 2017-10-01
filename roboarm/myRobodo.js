module.exports = { 
myRobodo: function(selected) {

//const selected = "start-left"

	if (selected === "") {
		selected = "start-left";
	}


	console.log("Function started");

	const NanoTimer = require('nanotimer')

	const makePwmDriver = require('./pwmDriver');
	const pwmDriver = makePwmDriver({address: 0x40, device: '/dev/i2c-1', debug: false});

	const rpio = require('rpio');
	const trigPin = 16;    // Trigger pin 16 = GPIO port 23

	// pause in mü sekunden zwischen den stellungen:
	const pause = 1 * 1000 * 1000;

	const iMoveSpeed = 10000;

	rpio.open(trigPin, rpio.OUTPUT, rpio.LOW);
	rpio.write(trigPin, rpio.HIGH);

	function usleep (micros) {
	  return new Promise(
	    function (resolve, reject) {
	      const timer = new NanoTimer()
	      timer.setTimeout(x => resolve(micros), '', `${micros}u`)
	      timer.clearInterval()
	    })
	}

	function moveSmooth(device, start, end)
	{
// console.log("Move Smooth ", device, " -> ", start, " -> ", end);		
		let direction = (end - start) > 0 ? 1 : -1;
		if(start === end) return Promise.resolve('Arrived');
		iPosition[device] = start+direction;
		return pwmDriver.setPWM(device, 0, iPosition[device])
			.then(function() { return usleep(iMoveSpeed) })
			.then(function() { return moveSmooth(device, iPosition[device], end) });
	}

	const iInit = { '0': 347, '1': 214, '2': 97, '3': 593, '4': 140, '5': 600 };

	const iPosition = { '0': 347, '1': 214, '2': 97, '3': 593, '4': 140, '5': 600 };

	console.log("Start moving");

	const arrMoves = [iPosition]; // erstelle array mit erstem eintrag initial stellung
	console.log(selected);
	switch(selected)
	{
		case "start-left":
			//console.log("Executing Path 1");
			arrMoves.push(iInit);
			
			arrMoves.push({ '0': 347, '1': 402, '2': 402, '3': 395, '4': 400, '5': 573 });

			arrMoves.push({ '0': 190, '1': 365, '2': 184, '3': 395, '4': 141, '5': 573 });

			arrMoves.push({ '0': 190, '1': 365, '2': 184, '3': 395, '4': 141, '5': 573 });

			arrMoves.push({ '0': 190, '1': 336, '2': 96, '3': 511, '4': 141, '5': 573 });

			arrMoves.push({ '0': 190, '1': 327, '2': 136, '3': 496, '4': 141, '5': 573 });

			arrMoves.push({ '0': 190, '1': 295, '2': 198, '3': 464, '4': 141, '5': 573 });

			arrMoves.push({ '0': 190, '1': 295, '2': 198, '3': 464, '4': 141, '5': 615 });

			arrMoves.push({ '0': 190, '1': 328, '2': 167, '3': 464, '4': 141, '5': 615 });

			arrMoves.push({ '0': 265, '1': 328, '2': 167, '3': 464, '4': 141, '5': 615 });
			
			break;
				
		case "start-right":
			//console.log("Executing Path 2");
			arrMoves.push({ 
			0: 490,
			1: 309,
			2: 172,
			3: 472,
			4: 130,
			5: 206
			});

			arrMoves.push({
			0: 498,
			1: 309, 
			2: 125,
			3: 472,
			4: 130,
			5: 206
			});

			arrMoves.push({
			0: 498,
			1: 309,
			2: 125,
			3: 472,
			4: 130,
			5: 290
			});

			arrMoves.push({
			0: 498,
			1: 387,
			2: 145,
			3: 622,
			4: 130,
			5: 290
			});

			arrMoves.push({
			0: 223,
			1: 387,
			2: 393,
			3: 374,
			4: 130,
			5: 290
			});

			arrMoves.push({
			0: 223,
			1: 370,
			2: 393,
			3: 374,
			4: 130,
			5: 290
			});

			arrMoves.push({
			0: 230,
			1: 379,
			2: 541,
			3: 572,
			4: 602,
			5: 290
			});

			arrMoves.push({
			0: 224,
			1: 348,
			2: 630,
			3: 489,
			4: 602,
			5: 290
			});

			arrMoves.push({
			0: 224,
			1: 348,
			2: 630,
			3: 489,
			4: 602,
			5: 242
			});

			arrMoves.push({
			0: 224,
			1: 348,
			2: 630,
			3: 489,
			4: 602,
			5: 290
			});

			arrMoves.push({
			0: 224,
			1: 348,
			2: 544,
			3: 489,
			4: 605,
			5: 290
			});

			break;
	}			

	arrMoves.push(iInit);

	//console.log("arrMoves : ", arrMoves);
	//console.log("arrMoves.length : ", arrMoves.length);



	let promiseChain = pwmDriver.init()
			.then(function() { return pwmDriver.setPWMFreq(60) })
			.then(function() { Promise.all([
					pwmDriver.setPWM(0, 0, iInit[0]),
					pwmDriver.setPWM(2, 0, iInit[2]),
					pwmDriver.setPWM(4, 0, iInit[4]),
					pwmDriver.setPWM(6, 0, iInit[6]),
					pwmDriver.setPWM(8, 0, iInit[8]),
					pwmDriver.setPWM(10, 0, iInit[10])
				])
			})
	//		.then(function() {
	for (var i = 0; i < arrMoves.length ; i++) {

		let moves = arrMoves[i];

		promiseChain = promiseChain.then(function() {
			let servoMoves = [];
			for(let key in moves) {
				
				servoMoves.push(moveSmooth(key, iPosition[key], moves[key]));
			}
			return Promise.all(servoMoves);
		})
		.then(function() { return usleep(pause) });
	}

	promiseChain.then(function() {
			rpio.write(trigPin, rpio.LOW);
			process.exit();
		rpio.write(trigPin, rpio.LOW);
	})
	.catch(function(err) {
		console.error(err);
	//	
	rpio.write(trigPin, rpio.LOW);
	})
	return promiseChain;
}}

