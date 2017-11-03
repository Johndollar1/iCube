// New Version with variable pause

module.exports = { 
myDispPanel: function() {

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

	const iInit = { '0': 497, '1': 214, '2': 97, '3': 593, '4': 140, '5': 573 };

	const iPosition = { '0': 497, '1': 214, '2': 97, '3': 593, '4': 140, '5': 573  };

	console.log("Start moving");

	const arrMoves = [iPosition]; // erstelle array mit erstem eintrag initial stellung
//	console.log(selected);
	arrMoves.push(iInit);

	arrMoves.push({ '0': 497, '1': 382, '2': 97, '3': 593, '4': 407, '5': 573 });

	arrMoves.push({ '0': 410, '1': 382, '2': 315, '3': 156, '4': 407, '5': 573 });

	arrMoves.push({ '0': 410, '1': 316, '2': 367, '3': 122, '4': 407, '5': 573 });

	arrMoves.push({ '0': 410, '1': 395, '2': 419, '3': 390, '4': 407, '5': 662 });

	arrMoves.push({ '0': 410, '1': 395, '2': 419, '3': 390, '4': 633, '5': 662 });

	arrMoves.push({ '0': 410, '1': 395, '2': 419, '3': 390, '4': 137, '5': 662 });

	arrMoves.push({ '0': 410, '1': 424, '2': 288, '3': 87, '4': 399, '5': 662 });

	arrMoves.push({ '0': 400, '1': 368, '2': 305, '3': 156, '4': 421, '5': 662 });

	arrMoves.push({ '0': 400, '1': 387, '2': 355, '3': 141, '4': 393, '5': 611 });

	arrMoves.push({ '0': 490, '1': 429, '2': 311, '3': 149, '4': 393, '5': 611 });

//	arrMoves.push();

//	arrMoves.push();

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

