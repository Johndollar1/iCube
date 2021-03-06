// 18.07.2017 peb
// c++ Keyboard Input Framework for the Roboter adjustment program
//
#include "PWM.h"
#include <wiringPi.h>
#include <stdio.h>
#include <unistd.h>
#include <termios.h>
#include <poll.h>

#define SWITCH 4

int iStep = 2;
int iPWMHatFD = -1;
int iMoveSpeed = 10000;

void gpioSetup()
        {
        wiringPiSetup();
        pinMode(SWITCH, OUTPUT);
        digitalWrite(SWITCH, LOW);
        delay(30);
        }

void setSwitch(bool switchOn)
        {
        if(switchOn==true)
                {
                digitalWrite(SWITCH, HIGH);
                }
        else
                {
                digitalWrite(SWITCH, LOW);
                }
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

void resetAllPWM(int on, int off)
{
    wiringPiI2CWriteReg8(iPWMHatFD, __ALL_LED_ON_L, on & 0xFF);
    wiringPiI2CWriteReg8(iPWMHatFD, __ALL_LED_ON_H, on >> 8);
    wiringPiI2CWriteReg8(iPWMHatFD, __ALL_LED_OFF_L, off & 0xFF);
    wiringPiI2CWriteReg8(iPWMHatFD, __ALL_LED_OFF_H, off >> 8);
}

void setPWM(int channel, int on, int off)
{
    wiringPiI2CWriteReg8(iPWMHatFD, __LED0_ON_L+4*channel, on & 0xFF);
    wiringPiI2CWriteReg8(iPWMHatFD, __LED0_ON_H+4*channel, on >> 8);
    wiringPiI2CWriteReg8(iPWMHatFD, __LED0_OFF_L+4*channel, off & 0xFF);
    wiringPiI2CWriteReg8(iPWMHatFD, __LED0_OFF_H+4*channel, off >> 8);
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

int getch(int ms)
{
	int ret;

	struct termios oldt, newt;
	struct pollfd pfds[1];
	tcgetattr(STDIN_FILENO, &oldt);
	newt = oldt;
	newt.c_lflag &= ~(ICANON | ECHO);
	tcsetattr(STDIN_FILENO, TCSANOW, &newt);
	pfds[0].fd = STDIN_FILENO;
	pfds[0].events = POLLIN;
	poll(pfds, 1, ms);
	if (pfds[0].revents & POLLIN)
	{
		char ch;
		read(STDIN_FILENO, &ch, 1);
		ret = ch;
	}
	else
	{
		ret = 0;
	}
	tcsetattr(STDIN_FILENO, TCSANOW, &oldt);
	return ret;
}

int main(void)
{
	int iServoNum [6] = {0, 2, 4, 6, 8, 10};
	int iServoPos[6] = {468, 356, 402, 380, 380, 260};
	int iArrayPosition;
	int iNewServoPosition;
	int iSelectedServo;
	int i, x;

	iSelectedServo = 0;

        printf("Initailizing GPIO\n");
        gpioSetup();

	printf("Init I2C to PWM HAt\n");
	iPWMHatFD = wiringPiI2CSetup(0x40);
	initPWM();
	printf("Sending init command to all PWM HAT devices\n");

	for (i = 0; i <= 5; i++)
	{
		printf("Set '%i' to '%i'\n", iServoNum[i], iServoPos[i]);
		setPWM(iServoNum[i], 0, iServoPos[i]);
	}

        printf("Setting SWITCH to HIGH\n");
        setSwitch(true);

	printf("Ready for input\n");

    	do
	{
       		if ((x = getch(500)))
		{
//printf("Character %i\n", x);
			if (x-49 >= 0 and x-49 <= 5)
			{
				iArrayPosition = x-49;
				iSelectedServo = iServoNum[iArrayPosition];
				printf ("Servo selected = '%i'\n", iSelectedServo);
    			}
			if (x == 109)
			{
				iNewServoPosition = iServoPos[iArrayPosition] + iStep;
				moveSlow(iSelectedServo, iServoPos[iArrayPosition], iNewServoPosition, iMoveSpeed);
				iServoPos[iArrayPosition] = iNewServoPosition;
				printf("Servo Value for Servo '%i' increased to '%i'\n", iSelectedServo, iNewServoPosition);
			}
			if (x == 108)
			{
				iNewServoPosition = iServoPos[iArrayPosition] - iStep;
				moveSlow(iSelectedServo, iServoPos[iArrayPosition], iNewServoPosition, iMoveSpeed);
				iServoPos[iArrayPosition] = iNewServoPosition;
				printf("Servo Value for Servo '%i' decreased to '%i'\n", iSelectedServo, iNewServoPosition);
			}
			if (x == 112)
			{
				printf("All Servo Values\n");
				for (i = 0; i <= 5; i++)
				{
					printf("Servo : '%i' -> Position : '%i'\n", iServoNum[i], iServoPos[i]);
				}
			}
		}
	}
	while (x != 'q');

	printf("Setting SWITCH to LOW\n");
	setSwitch(false);

	return 0;
}
