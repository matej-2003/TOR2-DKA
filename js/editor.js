CodeMirror.defineMode("simple", function (config) {
	return {
		token: function (stream, state) {
			// Skip whitespace
			if (stream.eatSpace()) {
				return null;
			}

			// Comment
			if (stream.match("#")) {
				stream.skipToEnd();
				return "comment";
			}

			// String
			if (stream.match(/['"]/)) {
				state.tokenize = tokenString(stream.current());
				return state.tokenize(stream, state);
			}

			// Number
			if (stream.match(/^-?\d*\.?\d+(?:e[+-]?\d+)?/i)) {
				return "number";
			}

			// Keyword
			if (stream.match(/(language|states)\b/)) {
				return "keyword";
			}

			// Operator
			if (stream.match(/(\*|\-\>)/)) {
				return "operator";
			}

			// Identifier
			if (stream.match(/^[a-zA-Z_]\w*/)) {
				return "variable";
			}

			// Invalid
			stream.next();
			return "error";
		}
	};
});

// Helper function for matching strings
function tokenString(quote) {
	return function (stream, state) {
		let escaped = false,
			next,
			end = false;
		while ((next = stream.next()) != null) {
			if (next == quote && !escaped) {
				end = true;
				break;
			}
			escaped = !escaped && next == "\\";
		}
		if (end || !(escaped || quote == "'")) {
			state.tokenize = null;
		}
		return "string";
	};
}

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