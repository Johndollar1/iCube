// New Version with variable pause

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
	const pause = 1 * 1000 * 1000; // 1e-6

	// const iMoveSpeed = 10000;

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

	function moveSmooth(device, start, end, sleep)
	{
// console.log("Move Smooth ", device, " -> ", start, " -> ", end);		
		let direction = (end - start) > 0 ? 1 : -1;
		if(start === end) return Promise.resolve('Arrived');
		iPosition[device] = start+direction;
		return pwmDriver.setPWM(device, 0, iPosition[device])
			.then(function() { return usleep(sleep) })
			.then(function() { return moveSmooth(device, iPosition[device], end, sleep) });
	}

	const iInit = { '0': 416, '1': 214, '2': 97, '3': 593, '4': 140, '5': 600 };

	const iPosition = { '0': 416, '1': 214, '2': 97, '3': 593, '4': 140, '5': 600 };

	console.log("Start moving");

	const arrMoves = [iPosition]; // erstelle array mit erstem eintrag initial stellung
	console.log(selected);
	switch(selected)
	{
		case "start-left":
			//console.log("Executing Path 1");
			arrMoves.push(iInit);
			
			arrMoves.push({ '0': 287, '1': 411, '2': 97, '3': 593, '4': 140, '5': 573 });

			arrMoves.push({ '0': 186, '1': 329, '2': 125, '3': 517, '4': 140, '5': 573 });

			arrMoves.push({ '0': 186, '1': 288, '2': 217, '3': 458, '4': 143, '5': 542 });

			arrMoves.push({ '0': 186, '1': 288, '2': 217, '3': 458, '4': 143, '5': 608 });

			arrMoves.push({ '0': 186, '1': 332, '2': 114, '3': 513, '4': 143, '5': 608 });

			arrMoves.push({ '0': 224, '1': 306, '2': 104, '3': 649, '4': 140, '5': 608 });

			arrMoves.push({ '0': 347, '1': 413, '2': 397, '3': 401, '4': 604, '5': 608 });

			arrMoves.push({ '0': 248, '1': 280, '2': 266, '3': 401, '4': 143, '5': 608 });

			arrMoves.push({ '0': 248, '1': 280, '2': 266, '3': 401, '4': 143, '5': 553 });

			arrMoves.push({ '0': 380, '1': 368, '2': 150, '3': 480, '4': 143, '5': 553 });

			break;
				
		case "start-right":
			//console.log("Executing Path 2");
			arrMoves.push(iInit);
			
			arrMoves.push({ '0': 400, '1': 411, '2': 97, '3': 593, '4': 140, '5': 573 });

			arrMoves.push({ '0': 470, '1': 329, '2': 125, '3': 517, '4': 140, '5': 573 });

			arrMoves.push({ '0': 470, '1': 288, '2': 217, '3': 458, '4': 143, '5': 542 });

			arrMoves.push({ '0': 470, '1': 288, '2': 217, '3': 458, '4': 143, '5': 608 });

			arrMoves.push({ '0': 470, '1': 332, '2': 114, '3': 513, '4': 143, '5': 608 });

			arrMoves.push({ '0': 430, '1': 306, '2': 104, '3': 649, '4': 140, '5': 608});

			arrMoves.push({ '0': 347, '1': 413, '2': 397, '3': 401, '4': 604, '5': 608 });

			arrMoves.push({ '0': 248, '1': 280, '2': 266, '3': 401, '4': 143, '5': 608 });

			arrMoves.push({ '0': 248, '1': 280, '2': 266, '3': 401, '4': 143, '5': 553 });

			arrMoves.push({ '0': 380, '1': 368, '2': 150, '3': 480, '4': 143, '5': 553 });
			
			break;
	}			

	arrMoves.push(iInit);

	//console.log("arrMoves : ", arrMoves);
	//console.log("arrMoves.length : ", arrMoves.length);



	let promiseChain = pwmDriver.init()
			.then(function() { return pwmDriver.setPWMFreq(60) })
			.then(function() { Promise.all([
					pwmDriver.setPWM(0, 0, iInit[0]),
					pwmDriver.setPWM(1, 0, iInit[1]),
					pwmDriver.setPWM(2, 0, iInit[2]),
					pwmDriver.setPWM(3, 0, iInit[3]),
					pwmDriver.setPWM(4, 0, iInit[4]),
					pwmDriver.setPWM(5, 0, iInit[5])
				])
			})
	//		.then(function() {
	for (var i = 0; i < arrMoves.length ; i++) {

		let moves = arrMoves[i];

		promiseChain = promiseChain.then(function() {
			let servoMoves = [];
			let maxDist = 0;
			for(let key in moves) {
				let dist = Math.abs(iPosition[key] - moves[key]);
				if(maxDist < dist) {
					maxDist = dist;
				}
			}
			for(let key in moves) {
				let dist = Math.abs(iPosition[key] - moves[key]);
				let sleep = maxDist * 8000 / dist;
				servoMoves.push(moveSmooth(key, iPosition[key], moves[key], sleep));
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

