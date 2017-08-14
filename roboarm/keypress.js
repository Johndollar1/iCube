
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

pwmDriver.init()
	.then(function() { return pwmDriver.setPWMFreq(60) })
	.then(function() {
		return Promise.all([
			pwmDriver.setPWM(0, 0, iInit[0]),
			pwmDriver.setPWM(2, 0, iInit[2]),
			pwmDriver.setPWM(4, 0, iInit[4]),
			pwmDriver.setPWM(6, 0, iInit[6]),
			pwmDriver.setPWM(8, 0, iInit[8]),
			pwmDriver.setPWM(10, 0, iInit[10])
		])
	})
	.then(function() { console.log('Robo ready!') });


const iInit = {
	 0: 468,
	 2: 356,
	 4: 402,
	 6: 380,
	 8: 380,
	10: 206
};
const iPositions = {
	 0: 468,
	 2: 356,
	 4: 402,
	 6: 380,
	 8: 380,
	10: 206
};

let currentDevice = 0;
stdin.on('data', function (key) 
{
//	console.(typeof key);
	if (key === '\u0003') {
		Promise.all([
			moveSmooth(0, iPositions[0], iInit[0]),
			moveSmooth(2, iPositions[2], iInit[2]),
			moveSmooth(4, iPositions[4], iInit[4]),
			moveSmooth(6, iPositions[6], iInit[6]),
			moveSmooth(8, iPositions[8], iInit[8]),
			moveSmooth(10, iPositions[10], iInit[10])
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
			currentDevice = 2;
			console.log('current Device: ' + currentDevice);
			break;
		case '3':
			currentDevice = 4;
			console.log('current Device: ' + currentDevice);
			break;
		case '4':
			currentDevice = 6;
			console.log('current Device: ' + currentDevice);
			break;
		case '5':
			currentDevice = 8;
			console.log('current Device: ' + currentDevice);
			break;
		case '6':
			currentDevice = 10;
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
