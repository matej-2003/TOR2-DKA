let code_input = $("#code");
let show_btn = $("#show");
let download_btn = $("#download");
let graph = null;
let nodes = [];
let edges = [];
let nodes_set = new vis.DataSet(nodes);
let edges_set = new vis.DataSet(edges);
let options = {
	edges: {
		arrows: 'to',
		color: '#0f0',
		physics: false,
		font: {
			color: '#ff0000',
			align: "top",
		},
		// shadow: true,
		// smooth: true,
	},
	nodes: {
		shape: "circle",
	}
}
// create a network
let container = document.getElementById("graph");
let data = {
	nodes: nodes_set,
	edges: edges_set,
};
// here all options that have shorthand notations are shown.
let network = new vis.Network(container, data, options);

network.on("afterDrawing", function (ctx) {
	let dataURL = ctx.canvas.toDataURL("image/png");
	document.getElementById('download').href = dataURL;
	// document.getElementById('preview_img').src = dataURL;
})

show_btn.click(() => {
	graph = new DFA(editor.getValue());
	show_graph();
});


download_btn.click(() => {
	// do not ask what the fuck is this because i do not know; i spent almost fucking hours trying to figure it out
	let dataURL = network.view.canvas.frame.canvas.toDataURL("image/png");
	document.getElementById('download').href = dataURL;
});


function show_graph() {
	nodes = [];
	for (let state of graph.states) {
		nodes.push(state);
	}
	edges = [];
	for (let [state1, state2, label] of graph.connections) {
		edges.push({ from: state1.id, to: state2.id, label: label });
	}
	nodes_set = new vis.DataSet(nodes);
	edges_set = new vis.DataSet(edges);
	data = {
		nodes: nodes_set,
		edges: edges_set,
	};
	network = new vis.Network(container, data, options);
}

function downloadFile() {
	let content = editor.getValue();
	let blob = new Blob([content], { type: "text/plain;charset=utf-8" });
	let url = URL.createObjectURL(blob);
	let link = document.createElement("a");
	link.href = url;
	link.download = "donwload.dfa";
	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);
}

function uploadFile() {
	let fileInput = document.getElementById("fileInput");
	let file = fileInput.files[0];
	let reader = new FileReader();
	reader.onload = function () {
		editor.setValue(reader.result);
	};
	reader.readAsText(file);
}
