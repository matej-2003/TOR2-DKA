import argparse
from os.path import isfile
from DFA import DFA, ACCEPTED, NOT_ACCEPTED

parser = argparse.ArgumentParser()

parser.add_argument("--file", "-f", type=str, required=True)
args = parser.parse_args()

if args:
	path = args.file
	if isfile(path):
		with open(path) as f:
			dfa = DFA(f.read())
			r = dfa.check_string("0")
			print(r == ACCEPTED)