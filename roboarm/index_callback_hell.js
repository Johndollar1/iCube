const I2C = require('i2c');
const rpio = require('rpio');

const i2c = new I2C(0x40, '/dev/i2c-1');

const MODE1 = 0x00;
const MODE2 = 0x01;
const SUBADR1 = 0x02;
const SUBADR2 = 0x03;
const SUBADR3 = 0x04;
const PRESCALE = 0xFE;
const LED0_ON_L = 0x06;
const LED0_ON_H = 0x07;
const LED0_OFF_L = 0x08;
const LED0_OFF_H = 0x09;
const ALL_LED_ON_L = 0xFA;
const ALL_LED_ON_H = 0xFB;
const ALL_LED_OFF_L = 0xFC;
const ALL_LED_OFF_H = 0xFD;

// Bits:
const RESTART = 0x80;
const SLEEP = 0x10;
const ALLCALL = 0x01;
const INVRT = 0x10;
const OUTDRV = 0x04;

const trigPin = 16;    // Trigger pin 16 = GPIO port 23

function setAllPWM(on, off, cb)
{
	return i2c.writeBytes(ALL_LED_ON_L, on & 0xFF, function (error, data) 
	{
          	if (error) cb(error);
		else i2c.writeBytes(ALL_LED_ON_H, on >> 8, function (error, data) 
		{
          		if (error) cb(error);
			else i2c.writeBytes(ALL_LED_OFF_L, off & 0xFF, function (error, data) 
			{
          			if (error) cb(error);
				else i2c.writeBytes(ALL_LED_OFF_H, off >> 8, function (error, data) 
				{
          				if (error) cb(error);
					else cb(null, data); 
        			}
        		}); 
        	}); 
        })

}





//const makePwmDriver = require('./pwmDriver');
//const pwmDriver = makePwmDriver({address: 0x40, device: '/dev/i2c-1', debug: false});

/*	i2c.readBytes(cmd, length, function (error, data) 
	{
        	if (error) 
		{
            	return reject(error)
          	}
        	resolve(data)
        });
*/

/*
        i2c.writeBytes(cmd, buf, function (error, data) 
	{
          	if (error) 
		{
        	return reject(error)
  	     	}
       		resolve(data)
        });
*/



rpio.open(trigPin, rpio.OUTPUT, rpio.LOW);

rpio.write(trigPin, rpio.HIGH);


pwmDriver.init()

	.then(() => pwmDriver.setPWMFreq(60))

	.then(() => pwmDriver.setPWM(0, 0, 400))
	
	.then(() => rpio.write(trigPin, rpio.LOW));

