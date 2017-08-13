
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
	let direction = (end - start) > 0 ? 1 : -1;
//	let direction = (end - start) / Math.abs(end - start);
	if(start === end) return Promise.resolve('Arrived');
	return pwmDriver.setPWM(device, 0, start+direction)
		.then(function() { return usleep(iMoveSpeed) })
		.then(function() { return moveSmooth(device, start+direction, end) });
}
pwmDriver.init()

	.then(function() { console.log(0); return pwmDriver.setPWMFreq(60) })

	.then(function() { return Promise.all([
		moveSmooth( 6, 380, 200),
		moveSmooth( 8, 380, 200)
		])
	})
	
	.then(function() { return usleep(1000 * 1000) })
	
//	.then(function() { console.log(2); return pwmDriver.setPWM(2, 0, 450) })

	.then(function() { return Promise.all([
		moveSmooth( 6, 200, 380),
		moveSmooth( 8, 200, 380)
		])
	})
	.then(function() { return usleep(1000 * 1000) })

	.then(function() { console.log(3); return rpio.write(trigPin, rpio.LOW) });


