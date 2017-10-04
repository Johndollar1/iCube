var fs = require('fs');
var inText = fs.readFileSync("ServoPos.inf");
console.log("File read");
var arrMovesSync = JSON.parse(inText);
console.log(arrMovesSync);

const makePwmDriver = require('./pwmDriver');
const pwmDriver = makePwmDriver({address: 0x40, device: '/dev/i2c-1', debug: false});

const rpio = require('rpio');

const NanoTimer = require('nanotimer')

const stdin = process.stdin;
stdin.setRawMode(true);
stdin.resume();
stdin.setEncoding('utf8');

const trigPin = 16;    // Trigger pin 16 = GPIO port 23

const iMoveSpeed = 8000;

rpio.open(trigPin, rpio.OUTPUT, rpio.LOW);

rpio.write(trigPin, rpio.HIGH);

//pwmDriver.init()
let promiseChain = pwmDriver.init()
	.then(function() { return pwmDriver.setPWMFreq(60) })
	.then(function() {
		return Promise.all([
			pwmDriver.setPWM(0, 0, iInit[0]),
			pwmDriver.setPWM(1, 0, iInit[1]),
			pwmDriver.setPWM(2, 0, iInit[2]),
			pwmDriver.setPWM(3, 0, iInit[3]),
			pwmDriver.setPWM(4, 0, iInit[4]),
			pwmDriver.setPWM(5, 0, iInit[5])
		])
	})
	.then(function() { console.log('Robo ready!') });

const iInit = arrMovesSync[0];
const iPositions = iInit;

let currentDevice = 0;
stdin.on('data', function (key) 
{
//	console.(typeof key);
	if (key === '\u0003') {
		Promise.all([
			moveSmooth(0, iPositions[0], iInit[0]),
			moveSmooth(1, iPositions[1], iInit[1]),
			moveSmooth(2, iPositions[2], iInit[2]),
			moveSmooth(3, iPositions[3], iInit[3]),
			moveSmooth(4, iPositions[4], iInit[4]),
			moveSmooth(5, iPositions[5], iInit[5])
		])
		.then(function() {
			rpio.write(trigPin, rpio.LOW);
			process.exit();
		})
	}
	switch(key)
	{
		case '1':
			currentDevice = 0;
			console.log('current Device: ' + currentDevice);
			break;
		case '2':
			currentDevice = 1;
			console.log('current Device: ' + currentDevice);
			break;
		case '3':
			currentDevice = 2;
			console.log('current Device: ' + currentDevice);
			break;
		case '4':
			currentDevice = 3;
			console.log('current Device: ' + currentDevice);
			break;
		case '5':
			currentDevice = 4;
			console.log('current Device: ' + currentDevice);
			break;
		case '6':
			currentDevice = 5;
			console.log('current Device: ' + currentDevice);
			break;
		case 'm':
//			console.log('more');
			pwmDriver.setPWM(currentDevice, 0, ++iPositions[currentDevice]);
			console.log(iPositions[currentDevice]);
			break;
		case 'l':
//			console.log('less');
			pwmDriver.setPWM(currentDevice, 0, --iPositions[currentDevice]);
			console.log(iPositions[currentDevice]);
			break;
		case 'p':
			console.log(iPositions);
		case 'i':
			console.log("Moving to initial position");
			for (var i = 0; i < arrMovesSync.length ; i++) {
				let moves = arrMovesSync[i];
				promiseChain = promiseChain.then(function() {
				let servoMoves = [];
				for(let key in moves) {
					servoMoves.push(moveSmooth(key, arrMovesSync[key], moves[key]));
				}
				return Promise.all(servoMoves);
			})
				.then(function() { return usleep(pause) });
			break;
		}
	}
//	console.log('current Device: ' + currentDevice);
});

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
	let direction = (end - start) > 0 ? 1 : -1;
//	let direction = (end - start) / Math.abs(end - start);
	if(start === end) return Promise.resolve('Arrived');
	return pwmDriver.setPWM(device, 0, start+direction)
		.then(function() { return usleep(iMoveSpeed) })
		.then(function() { return moveSmooth(device, start+direction, end) });
}
