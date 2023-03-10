

// CodeMirror.defineMode("dfa", function (config, parserConfig) {
// 	let myMode = CodeMirror.getMode(config, "text/plain");

// 	function tokenizeUppercase(stream, state) {
// 		if (stream.match(/^[A-Z][a-z0-9_]*/)) {
// 			return "dfa-uppercase";
// 		}
// 		stream.next();
// 		return null;
// 	}

// 	return {
// 		startState: function () {
// 			return {
// 				tokenize: tokenizeUppercase,
// 				localMode: null
// 			};
// 		},
// 		token: function (stream, state) {
// 			return state.tokenize(stream, state);
// 		}
// 	};
// });

// Define the regular expression patterns for each token type
const tokenPatterns = [
	{ type: 'LABEL', pattern: /^[^:#]+:/ },
	{ type: 'COMMENT', pattern: /^#.*/ },
	{ type: 'ARROW', pattern: /^->/ },
	{ type: 'ASTERISK', pattern: /^\*/ },
	{ type: 'GREATER_THAN', pattern: /^>/ },
	{ type: 'LPAREN', pattern: /^\(/ },
	{ type: 'RPAREN', pattern: /^\)/ },
	{ type: 'LBRACE', pattern: /^\{/ },
	{ type: 'RBRACE', pattern: /^\}/ },
	{ type: 'LBRACKET', pattern: /^\[/ },
	{ type: 'RBRACKET', pattern: /^\]/ },
	{ type: 'COLON', pattern: /^:/ },
	{ type: 'STRING', pattern: /^[^#\->*\(\){}\[\]:]+/ },
];

// Define the tokenizer function
function tokenize(input) {
	const tokens = [];
	let remainingInput = input.trim();

	while (remainingInput.length > 0) {
		let match = false;

		for (let i = 0; i < tokenPatterns.length; i++) {
			const pattern = tokenPatterns[i].pattern;
			const type = tokenPatterns[i].type;

			const result = pattern.exec(remainingInput);

			if (result !== null) {
				match = true;
				const value = result[0];
				tokens.push({ type, value });
				remainingInput = remainingInput.slice(value.length);
				break;
			}
		}

		if (!match) {
			throw new Error(`Invalid syntax near '${remainingInput}'`);
		}
	}

	return tokens;
}


CodeMirror.defineMode("dfa", function () {
	return {
		token: function (stream) {
			const tokens = tokenize(stream.string);

			if (tokens.length === 0) {
				stream.skipToEnd();
				return null;
			}

			const { type, value } = tokens[0];
			stream.pos += value.length;

			switch (type) {
				case 'LABEL':
					return 'label';
				case 'COMMENT':
					return 'comment';
				case 'ARROW':
				case 'ASTERISK':
				case 'GREATER_THAN':
				case 'LPAREN':
				case 'RPAREN':
				case 'LBRACE':
				case 'RBRACE':
				case 'LBRACKET':
				case 'RBRACKET':
				case 'COLON':
					return 'special';
				case 'STRING':
					return 'string';
				default:
					throw new Error(`Invalid token type: ${type}`);
			}
		}
	}
});

CodeMirror.defineMIME("text/x-dfa", "dfa");


let editor = CodeMirror.fromTextArea(document.getElementById("code"), {
	// mode: "javascript",
	mode: "dfa",
	lineNumbers: true,
	tabSize: 2,
	indentWithTabs: true,
	theme: "default",
	extraKeys: {
		"Ctrl-Space": "autocomplete"
	}
});