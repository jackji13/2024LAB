let satellites = [];
let x, y;

d3.text('assets/satellites.txt').then(function (data) {
    satellites = parseTLEData(data);
    setupChart(satellites);
    if (satellites.length > 0) {
        updateChart([satellites[0]]);
        updateInfoSection(satellites[0]);
    }
    d3.selectAll("#satellite-list li").on("click", function(event, d) {
        const selectedSatelliteName = d3.select(this).text();
        const selectedSatellite = satellites.filter(satellite => satellite.name === selectedSatelliteName);
        updateChart(selectedSatellite);
        updateInfoSection(selectedSatellite[0]);
    });
});

function setupChart(satellites) {
    const container = d3.select("#chart-container");
    const containerWidth = container.node().getBoundingClientRect().width;
    const containerHeight = container.node().getBoundingClientRect().height;
    const margin = { top: 20, right: 30, bottom: 40, left: 50 };
    const width = containerWidth - margin.left - margin.right;
    const height = containerHeight - margin.top - margin.bottom;
    const svg = container.append("svg")
        .attr("width", containerWidth)
        .attr("height", containerHeight)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);
    x = d3.scaleLinear()
        .domain([0, d3.max(satellites, d => d.inclination)])
        .range([0, width]);
    svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x))
        .append("text")
        .attr("fill", "#17f700")
        .attr("y", 35)
        .attr("x", width / 2)
        .attr("text-anchor", "middle")
        .text("Orbital Inclination (Degrees)");
    y = d3.scaleLinear()
        .domain([0, d3.max(satellites, d => d.meanMotion)])
        .range([height, 0]);
    svg.append("g")
        .call(d3.axisLeft(y))
        .append("text")
        .attr("fill", "#17f700")
        .attr("y", -35)
        .attr("x", -height / 2)
        .attr("dy", ".71em")
        .attr("text-anchor", "middle")
        .attr("transform", "rotate(-90)")
        .text("Mean Motion Speed (Orbits/Day)");
    svg.append("circle")
        .attr("id", "satellite-circle")
        .attr("r", 6)
        .style("fill", "#17f700");
}

function updateChart(satelliteData) {
    const circle = d3.select("#satellite-circle");
    circle.transition()
        .duration(1000)
        .attr("cx", d => x(satelliteData[0].inclination))
        .attr("cy", d => y(satelliteData[0].meanMotion))
        .style("fill", "#17f700");
    circle.on("mouseover", function(event, d) {
            d3.select(this).style("fill", "#ffffff");
            d3.select("svg")
                .append("text")
                .attr("id", "tooltip")
                .attr("x", x(satelliteData[0].inclination) + 5)
                .attr("y", y(satelliteData[0].meanMotion) - 10)
                .attr("fill", "#ffffff")
                .text(`${satelliteData[0].name}`);
        })
        .on("mouseout", function() {
            d3.select(this).style("fill", "#17f700");
            d3.select("#tooltip").remove();
        });
}

function updateInfoSection(satellite) {
    const infoSection = d3.select("#info-section");
    infoSection.html("");
    infoSection.append("li").text(`Satellite Name: ${satellite.name}`);
    infoSection.append("li").text(`Catalog Number: ${satellite.tleLine1.substring(2, 7)}`);
    infoSection.append("li").text(`Inclination: ${satellite.inclination.toFixed(2)}°`);
    infoSection.append("li").text(`Mean Motion: ${satellite.meanMotion.toFixed(5)} orbits/day`);
    infoSection.append("li").text(`Eccentricity: ${satellite.tleLine2.substring(26, 33)}`);
    infoSection.append("li").text(`Argument of Perigee: ${satellite.tleLine2.substring(34, 42)}°`);
    infoSection.append("li").text(`Mean Anomaly: ${satellite.tleLine2.substring(43, 51)}°`);
}

function parseTLEData(data) {
    const lines = data.split('\n').filter(line => line.trim() !== '');
    const satellites = [];
    for (let i = 0; i < lines.length; i += 3) {
        const name = lines[i]?.trim();
        const tleLine1 = lines[i + 1]?.trim();
        const tleLine2 = lines[i + 2]?.trim();
        if (name && tleLine1 && tleLine2) {
            const meanMotion = parseFloat(tleLine2.substring(52, 63));
            const inclination = parseFloat(tleLine2.substring(8, 16));
            satellites.push({ name, tleLine1, tleLine2, meanMotion, inclination });
        }
    }
    return satellites;
}