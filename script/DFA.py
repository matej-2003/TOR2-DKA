STATES = "states"
LANGUAGE = "language"
COMMENT_DELIMITER = "#"

ACCEPTED = 0
NOT_ACCEPTED = 1
ERROR = 2

class DFAState:
	def __init__(self, name):
		self.name = name
		self.connections = {}
	
	def add_connection(self, char, state):
		self.connections[char] = state
		# print(f"{char} -> {state}")

	def next(self, char):
		return self.connections.get(char)

	def __repr__(self):
		return f"State({self.name}, {len(self.connections)})"


class DFA:
	def __init__(self, setup):
		self.initial_state = None
		self.final_states = []
		self.states = []
		self.state_connections = []
		self.language = []
		self.parse_setup(setup)
		self.current_state = self.initial_state

	def parse_setup(self, setup):
		tokens = setup.split(";")
		statments = []
		states = None
		language = None

		# tokenise
		for i, token in enumerate(tokens):
			token = token.strip()

			if not token:
				continue

			if token[0] == COMMENT_DELIMITER:
				continue

			sub_tokens = token.split(":")
			declaration, definition = sub_tokens
			statments.append((
				declaration.strip(),
				definition.strip()
			))

		for i in range(len(statments)-1, -1, -1):
			declaration, definition = statments[i]

			if declaration == STATES:
				states = definition
				statments.pop(i)

			if declaration == LANGUAGE:
				language = definition
				statments.pop(i)
			
			if states and language:
				break

		self.parse_states(states)
		self.parse_language(language)
		self.parse_connections(statments)

		# make connections
		for s1, c, s2 in self.state_connections:
			s1 = self.find_state(s1)
			s2 = self.find_state(s2)

			if s1 and s2:
				s1.add_connection(c, s2)
				# print(s1, s2)
		
		# print(self.states)

	def parse_states(self, states_setup):
		states_ = states_setup.strip().strip(",").split(",")
		for i, e in enumerate(states_):
			states_[i] = e.strip()

		for s in states_:
			# print(s)
			if s[0] == ">":
				self.initial_state = DFAState(s[1])
			elif s[0] == "*":
				self.final_states.append(DFAState(s[1]))
			else:
				self.states.append(DFAState(s))

		self.states.append(self.initial_state)
		self.states.extend(self.final_states)		

	def parse_language(self, language_setup):
		self.language = list(language_setup.strip())
		self.language.pop(0)
		self.language.pop(-1)
		self.language = list(set(self.language))
	
	def parse_connections(self, connection_setup):
		for s, c in connection_setup:
			con_tokens = c.split("->")
			letter, state = con_tokens
			self.state_connections.append((
				s,
				letter.strip(),
				state.strip(),
			))
		# print(self.connections)

	def find_state(self, name):
		for s in self.states:
			if s.name == name:
				return s
	
	def check_string(self, input_string):
		for i in input_string:
			if i not in self.language:
				return ERROR
		
		for c in input_string:
			state = self.current_state.next(c)
			if state:
				self.current_state = state

		if self.current_state in self.final_states:
			return ACCEPTED
		else:
			return NOT_ACCEPTED