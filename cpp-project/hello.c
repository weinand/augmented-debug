#include <stdio.h>

int main(int argc, char *argv[]) {
	for (int i = 0; i < argc; i++) {
		fprintf(stdout, "argv[%d]: %s\n", i, argv[i]);
	}

	int a[100000];
    for (int i = 0; i < 100000; i++) {
        a[i] = i;
	}

	return 0;
}