const makePwmDriver = require('./pwmDriver');
const pwmDriver = makePwmDriver({address: 0x40, device: '/dev/i2c-1', debug: true});

const rpio = require('rpio');

const NanoTimer = require('nanotimer')

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

const iPosition = {
	0: 468,
	2: 356,
	4: 402,
	6: 380,
	8: 380,
	10: 206
};

const arrMoves = [iPosition]; // erstelle array mit erstem eintrag initial stellung

// danach definieren wir weitere stellungen welche wir nach einander einnehmen wollen
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

// pause in mü sekunden zwischen den stellungen:
const pause = 3 * 1000 * 1000;

let promiseChain = pwmDriver.init()
		.then(function() { return pwmDriver.setPWMFreq(60) });

for (var i = 0; i < arrMoves.length; i++) {
	// der befehl hier unten ist ganz wichtig damit (zeitlich) später wenn in der promise chain
	// auf arrMoves[i] zugegriffen wird, i nicht grösser ist als die länge von arrMoves
	// hier helfen scope variabeln (als let deklariert) um sicher zu sein, dass
	// zu einem späteren zeitpunkt immernoch auf die gleiche speicherstelle verwiesen wird
	let moves = arrMoves[i];

	// hier ketten wir alle bewegungsabläufe hinter einander und schieben den promiseChain pointer ans ende der kette:
	promiseChain = promiseChain.then(function() {
		// hier drin stünde arrMoves[i], da aber die for loop schon lange ausgeführt wurde bis
		// wir in diesen teil der promise chain springen, wäre i grösser als die länge von arrMoves
		// daher benutzen wir hier moves, welches für jede schleifen-iteration eine eindeutige verweisung
		// aufrecht erhält... JavaScript magic!
		let servoMoves = [];
		// durch diese schleife kann man beliebig viele motoren gleichzeitig bewegen (so viele wie im move objekt deklariert sind):
		for(let key in moves) {
			// iPosition haben wir ja glaube ich in moveSmooth verwendet um die aktuelle position zu speichern:
			servoMoves.append(moveSmooth(key, iPosition[key], moves[key]))
		}
		// servo moves ist nun ein array aus einzelnen promises die von moveSmooth zurück gegeben wurden, für jeden servo eine promise
		return Promise.all(servoMoves); // alle servos gleichzeitig bewegen und erst weiter gehen wenn alle fertig sind
	})
	.then(function() { return usleep(pause) });
}

Promise.all([
	moveSmooth(0, iPositions[0], iInit[0]),
	moveSmooth(2, iPositions[2], iInit[2]),
	moveSmooth(4, iPositions[4], iInit[4]),
	moveSmooth(6, iPositions[6], iInit[6]),
	moveSmooth(8, iPositions[8], iInit[8]),
	moveSmooth(10, iPositions[10], iInit[10])
	])

promiseChain.then(function() {
	console.log('Done with all movements!')
	rpio.write(trigPin, rpio.LOW);
})
.catch(function(err) {
	console.error(err);
	rpio.write(trigPin, rpio.LOW);
})

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
