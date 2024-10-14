let data = [];

function updateData() {
	data = [];
	for(let i=0; i<5; i++) {
		data.push(Math.random() * 800);
	}
}

function update() {
	d3.select('svg')
		.selectAll('circle')
		.data(data)
		.join('circle')
		.attr('cy', 50)
		.attr('r', 40)
		.transition()
		.attr('cx', function(d) {
			return d;
		});
}

function updateAll() {
	updateData();
	update();
}

updateAll();