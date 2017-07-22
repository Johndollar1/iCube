#include "PWM.h"
#include <wiringPi.h>
#include <stdio.h>
#include <unistd.h>
//#include <math.h>
#include <stdlib.h>
#include <string.h>
//#include <libconfig.h>

#define TRIG 4
#define ECHO 5

char sConfigFileName[] = "/home/pi/projects/family-project/i2c/armconfig.ini";

int iPWMHatFD = -1;
int iMoveSpeed = 10000;

//			min, mid, max
double dLimitArray[] = {0, 0, 0, 0, 0};

void gpioSetup()
{
	wiringPiSetup();
	pinMode(TRIG, OUTPUT);
	pinMode(ECHO, INPUT);

	//TRIG pin has to be low
	digitalWrite(TRIG,LOW);

	delay(30);
}

bool bCalcArray(double *dArray)
	{

	dArray[3] = (dArray[1] - dArray[0]) / 100;
	dArray[4] = (dArray[2] - dArray[1]) / 100;

	return true;

	}

int strToint(char *inString)
	{
	int i, iLen;
	int iResult = 0;

	iLen = strlen(inString);

	if (inString[0] == '-')
		{
		for(i = 1; i < iLen; i++)
			{
			iResult = iResult * 10 + (inString[i] - '0');
			}
		iResult = 0 - iResult;
		}
	else
		{
		for(i = 0; i < iLen; i++)
			{
			iResult = iResult * 10 + (inString[i] - '0');
			}
		}

	return(iResult);
	}

void initPWM(int address)
{
    iPWMHatFD = wiringPiI2CSetup(address);


    // zero all PWM ports
    resetAllPWM(0,0);

    wiringPiI2CWriteReg8(iPWMHatFD, __MODE2, __OUTDRV);
    wiringPiI2CWriteReg8(iPWMHatFD, __MODE1, __ALLCALL);

    int mode1 = wiringPiI2CReadReg8(iPWMHatFD, __MODE1);
    mode1 = mode1 & ~__SLEEP;
    wiringPiI2CWriteReg8(iPWMHatFD, __MODE1, mode1);

    setPWMFreq(60);
}

void setPWMFreq(int freq)
{
    float prescaleval = 25000000;
    prescaleval /= 4096.0;
    prescaleval /= (float)freq;
    prescaleval -= 1.0;
//    int prescale = floor(prescaleval + 0.5);

    int oldmode = wiringPiI2CReadReg8(iPWMHatFD, __MODE1);
    int newmode = (oldmode & 0x7F) | 0x10;
    wiringPiI2CWriteReg8(iPWMHatFD, __MODE1, newmode);
//    wiringPiI2CWriteReg8(iPWMHatFD, __PRESCALE, floor(prescale));
    wiringPiI2CWriteReg8(iPWMHatFD, __PRESCALE, 101);

    wiringPiI2CWriteReg8(iPWMHatFD, __MODE1, oldmode);

    wiringPiI2CWriteReg8(iPWMHatFD, __MODE1, oldmode | 0x80);
}

void setPWM(int channel, int on, int off)
{
    wiringPiI2CWriteReg8(iPWMHatFD, __LED0_ON_L+4*channel, on & 0xFF);
    wiringPiI2CWriteReg8(iPWMHatFD, __LED0_ON_H+4*channel, on >> 8);
    wiringPiI2CWriteReg8(iPWMHatFD, __LED0_OFF_L+4*channel, off & 0xFF);
    wiringPiI2CWriteReg8(iPWMHatFD, __LED0_OFF_H+4*channel, off >> 8);
}

void resetAllPWM(int on, int off)
{
    wiringPiI2CWriteReg8(iPWMHatFD, __ALL_LED_ON_L, on & 0xFF);
    wiringPiI2CWriteReg8(iPWMHatFD, __ALL_LED_ON_H, on >> 8);
    wiringPiI2CWriteReg8(iPWMHatFD, __ALL_LED_OFF_L, off & 0xFF);
    wiringPiI2CWriteReg8(iPWMHatFD, __ALL_LED_OFF_H, off >> 8);
}

void moveSlow(int sNum, int curPos, int toPos, int mSpeed)
{

    int loopCount = curPos;

    if(curPos >= toPos)
	{
	while(loopCount >= toPos)
		{
		setPWM(sNum, 0, loopCount);
		loopCount = loopCount -1;
		usleep(mSpeed);
		}
	}
    else
	{
	while (toPos >= loopCount)
		{
		setPWM(sNum, 0, loopCount);
		loopCount = loopCount+1;
		usleep(mSpeed);
		}
	}

}


int main(int argc, char **argv)
{

	int iInit[1][6] = {
		{2, 0, 4, 6, 8, 10},
		{430, 458, 504, 108, 306, 614}
	};

	int iMoves[2][14][14] = {
		{4, 2, 0, 6, 2, 8, 4, 2, 10, 2, 0, 2, 8, 10},
		{504, 430, 458, 108, 324, 306, 406, 292, 614, 260, 334, 396, 546, 538},
		{406, 324, 334, 516, 292, 546, 386, 260, 538, 396, 572, 338, 326, 454}
	};

	int iPark[2][6][6] = {
		{2, 0, 4, 6, 8, 10},
		{338, 572, 386, 516, 326, 454},
		{430, 458, 504, 108, 306, 614}
	};

	int iPtr;

	printf("Init I2C to PWM HAt\n");
	iPWMHatFD = wiringPiI2CSetup(0x40);
	initPWM();
	printf("Sending init command to all PWM HAT devices\n");
	
	For (iPtr = 0; iPtr < 6; iPtr++)
	{
		printf("Setting Servo '%i' to '%i'\n", iInit[0][iPtr], iInit[1][iPtr]);
		setPWM(iInit[0][iPtr], 0, iInit[1][iPtr]);
	}


	print("Sending move commands to servos !\n");

	for (iPtr = 0; iPtr < 14; iPtr++)
	{
		printf("Setting Servo '%i' from '%i' to '%i'\n", iMoves[0][iPtr], iMoves[1][iPtr], iMoves[2][iPtr]);
		moveSlow(iMoves[0][iPtr], iMoves[1][iPtr], iMoves[2][iPtr], iMoveSpeed);
	}

	print("Sending park commands to servos !\n");

	for (iPtr = 0; iPtr < 14; iPtr++)
	{
		printf("Setting Servo '%i' from '%i' to '%i'\n", iPark[0][iPtr], iPark[1][iPtr], iPark[2][iPtr]);
		moveSlow(iPark[0][iPtr], iPark[1][iPtr], iPark[2][iPtr], iMoveSpeed);
	}

/*
	setPWM(0, 0, 369);
	setPWM(2, 0, 756);
	setPWM(4, 0, 530);
	setPWM(6, 0, 216);
	setPWM(8, 0, 307);
	setPWM(10, 0, 488);
*/

	return 0;

}
