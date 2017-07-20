// 18.07.2017 peb
// c++ Keayboard Input Framework for the Roboter adjustment program
//

#include <stdio.h>
#include <unistd.h>
#include <termios.h>
#include <poll.h>

int getch(int ms);

int main(void)
{

	int iServoNum [6] = {0, 2, 4, 6, 8, 10};
	int iSelectedServo;
	int x;

	iSelectedServo = 0;

    	do 
	{
       		if ((x = getch(500)))
		{
			if (x-49 >= 0 and x-49 <= 5)
			{
				iSelectedServo = iServoNum[x-49];
				printf ("Servo selected = '%i'\n", iSelectedServo);
    			}
			if (x == 109)
			{
				printf("Increasing Servo Value\n");
			}
			if (x == 108)
			{
				printf("Decreasing Servo Value\n");
			}
		}
	}
	while (x != 'q');
    
	return 0;

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
    if (pfds[0].revents & POLLIN) {
        char ch;
        read(STDIN_FILENO, &ch, 1);
        ret = ch;
    } else {
        ret = 0;
    }
    tcsetattr(STDIN_FILENO, TCSANOW, &oldt);
    return ret;
}
