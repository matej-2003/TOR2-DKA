const STATES = "states";
const LANGUAGE = "language";
const COMMENT_DELIMITER = "#";

const ACCEPTED = 0;
const NOT_ACCEPTED = 1;
const ERROR = 2;

const INITIAL_STATE = 1;
const FINAL_STATE   = 2;

class DFAState {
	constructor(label) {
		this.label = label;
		this.connections = {};
		this.id = Math.floor(Math.random() * 1000000);
		this.status = 0;
		this.color = null;
	}

	add_connection(char, state) {
		this.connections[char] = state;
	}

	next(char) {
		return this.connections[char];
	}

	toString() {
		return `State(${this.label}, ${Object.keys(this.connections).length})`;
	}

	set_status(status) {
		this.status = status;
		if (this.status == INITIAL_STATE) {
			this.color = "#ffad8f";
			this.shape = "box";
		} else if (this.status == FINAL_STATE) {
			this.color = "#fffc5c";
			this.shape = "ellipse";
		}
	}
}



class DFA {
	constructor(setup) {
		this.initial_state = null;
		this.final_states = [];
		this.states = [];
		this.state_connections = [];
		this.connections = [];
		this.language = [];
		this.parse_setup(setup);
		this.current_state = this.initial_state;
	}

	parse_setup(setup) {
		const tokens = setup.split(";");
		const statments = [];
		let states = null;
		let language = null;

		// tokenise
		for (let i = 0; i < tokens.length; i++) {
			let token = tokens[i].trim();

			if (!token) {
				continue;
			}

			if (token[0] == COMMENT_DELIMITER) {
				continue;
			}

			const sub_tokens = token.split(":");
			const declaration = sub_tokens[0].trim();
			const definition = sub_tokens[1].trim();
			statments.push([declaration, definition]);
		}

		for (let i = statments.length - 1; i >= 0; i--) {
			const declaration = statments[i][0];
			const definition = statments[i][1];

			if (declaration === STATES) {
				states = definition;
				statments.splice(i, 1);
			}

			if (declaration === LANGUAGE) {
				language = definition;
				statments.splice(i, 1);
			}

			if (states !== null && language !== null) {
				break;
			}
		}

		this.parse_states(states);
		this.parse_language(language);
		this.parse_connections(statments);

		// make connections
		// for (let i = 0; i < this.state_connections.length; i++) {
		// 	const [s1, c, s2] = this.state_connections[i];
		// 	const state1 = this.find_state(s1);
		// 	const state2 = this.find_state(s2);

		// 	if (state1 && state2) {
		// 		state1.add_connection(c, state2);
		// 		this.connections.push([state1, state2]);
		// 	}
		// }
	}

	parse_states(states_setup) {
		const states_ = states_setup.trim().replace(/,$/, "").split(",");
		for (let i = 0; i < states_.length; i++) {
			states_[i] = states_[i].trim();
		}

		for (let i = 0; i < states_.length; i++) {
			const s = states_[i];

			if (s[0] === ">") {
				let label = s.substring(1);
				this.initial_state = new DFAState(label);
				this.initial_state.set_status(INITIAL_STATE);		// do not wonder what this is for its magic
			} else if (s[0] === "*") {
				let label = s.substring(1);
				let final_state = new DFAState(label);
				final_state.set_status(FINAL_STATE);		// do not wonder what this is for its magic
				this.final_states.push(final_state);
			} else {
				this.states.push(new DFAState(s));
			}
		}

		this.states.push(this.initial_state);
		this.states.push(...this.final_states);
	}

	parse_language(language_setup) {
		this.language = language_setup.split("");
		this.language = [...new Set(this.language)];
	}

	parse_connections(connection_setup) {
		for (const [state, connection] of connection_setup) {
			const [letter, next_state] = connection.split("->");
			const source_state = this.find_state(state);
			const target_state = this.find_state(next_state.trim());

			if (source_state && target_state) {
				source_state.add_connection(letter.trim(), target_state);
				this.connections.push([source_state, target_state, letter]);
			}
		}
	}

	find_state(label) {
		for (const state of this.states) {
			if (state.label === label) {
				return state;
			}
		}
		return null;
	}

	check_string(input_string) {
		for (const c of input_string) {
			if (!this.language.includes(c)) {
				return ERROR;
			}
		}

		for (const c of input_string) {
			const next_state = this.current_state.next(c);
			if (next_state) {
				this.current_state = next_state;
			}
		}

		return this.final_states.includes(this.current_state) ? ACCEPTED : NOT_ACCEPTED;
	}
}