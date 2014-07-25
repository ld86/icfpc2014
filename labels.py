#!/usr/bin/python

import sys

file = str(sys.argv[1])
lines = open(file, "r")
lines = map(str.strip, lines)
lines = filter(None, lines)

labels = {}
l = 0
output = ""
for line in lines:
	if line.endswith(':'):
		labels[line[:-1]] = l
	else:
		output += line + '\n'
		l += 1

for label in labels.keys():
	output = output.replace(label, str(labels[label]))

print output