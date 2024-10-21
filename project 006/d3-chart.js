// Basic D3 chart setup
const width = document.getElementById("chart-container").clientWidth;
const height = document.getElementById("chart-container").clientHeight;

const svg = d3.select("#chart-container")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

// Example data (satellite altitudes, etc.)
const sampleData = [100, 200, 300, 400, 500];

// Create a bar chart for demonstration
const xScale = d3.scaleBand()
    .domain(sampleData.map((d, i) => i))
    .range([0, width])
    .padding(0.1);

const yScale = d3.scaleLinear()
    .domain([0, d3.max(sampleData)])
    .range([height, 0]);

svg.selectAll(".bar")
    .data(sampleData)
    .enter()
    .append("rect")
    .attr("class", "bar")
    .attr("x", (d, i) => xScale(i))
    .attr("y", d => yScale(d))
    .attr("width", xScale.bandwidth())
    .attr("height", d => height - yScale(d))
    .attr("fill", "#17f700");
