let exports = modules.exports = function roboDo(selected)
{

	const NanoTimer = require('nanotimer')

	const makePwmDriver = require('./pwmDriver');
	const pwmDriver = makePwmDriver({address: 0x40, device: '/dev/i2c-1', debug: false});

	const rpio = require('rpio');
	const trigPin = 16;    // Trigger pin 16 = GPIO port 23

	const iMoveSpeed = 8000;

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

	const iInit = {
		0: 468,
		2: 356,
		4: 402,
		6: 380,
		8: 380,
		10: 206
	};

	const iPosition = {
		0: 468,
		2: 356,
		4: 402,
		6: 380,
		8: 380,
		10: 206
	};

	//const arrMoves = [iPosition]; // erstelle array mit erstem eintrag initial stellung
	const arrMoves = [iPosition]; // erstelle array mit erstem eintrag initial stellung

	switch(selected)
	{
		case 1:
			arrMoves.push({
			4: 625,
			6: 399
			});

			arrMoves.push({
	       	10: 280,
			});

			arrMoves.push({
			0: 235,
			2: 553,
			4: 584,
			6: 257,
			});

			arrMoves.push({
	       	10: 200
			});
				
		case 2:
			arrMoves.push({
			4: 600,
			6: 350
			});

			arrMoves.push({
	       	10: 230,
			});

			arrMoves.push({
			0: 220,
			2: 500,
			4: 500,
			6: 200,
			});

			arrMoves.push({
	       	10: 200
			});

	}			

	arrMoves.push({
	0: 468,
	2: 356,
	4: 402,
	6: 380,
	8: 380,
	10: 206
	});

	console.log("arrMoves : ", arrMoves);
	//console.log("arrMoves.length : ", arrMoves.length);

	// pause in mü sekunden zwischen den stellungen:
	const pause = 3 * 1000 * 1000;

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
				console.log("Key : ", key, " -> iPosition : ", iPosition[key], " -> moves : ", moves[key]);
				servoMoves.push(moveSmooth(key, iPosition[key], moves[key]));
			}
			// servo moves ist nun ein array aus einzelnen promises die von moveSmooth zurück gegeben wurden, für jeden servo eine promise
			return Promise.all(servoMoves); // alle servos gleichzeitig bewegen und erst weiter gehen wenn alle fertig sind
		})
		.then(function() { return usleep(pause) });
	}

	promiseChain.then(function() {
			rpio.write(trigPin, rpio.LOW);
			process.exit();
		console.log('Done with all movements!')
		rpio.write(trigPin, rpio.LOW);
	})
	.catch(function(err) {
		console.error(err);
	//	rpio.write(trigPin, rpio.LOW);
	})
	return promiseChain;
}