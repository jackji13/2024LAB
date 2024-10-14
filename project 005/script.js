const apiKey = 'm74f3CQvQIpViRDa4PzFhmfttcZ8pENZSqlfgOFf';
const neoWsEndpoint = `https://api.nasa.gov/neo/rest/v1/feed?start_date=2024-10-10&end_date=2024-10-13&api_key=${apiKey}`;

fetch(neoWsEndpoint)
    .then(response => response.json())
    .then(data => {
        const neoData = processData(data);
        populateNeoList(neoData);
    })
    .catch(error => console.error("Error fetching NEO data:", error));

function processData(data) {
    let neoObjects = [];
    const nearEarthObjects = data.near_earth_objects;

    for (const date in nearEarthObjects) {
        nearEarthObjects[date].forEach(asteroid => {
            const diameter = asteroid.estimated_diameter.kilometers.estimated_diameter_max;
            neoObjects.push({
                name: asteroid.name,
                diameter: diameter,
                velocity: asteroid.close_approach_data[0].relative_velocity.kilometers_per_hour,
                missDistance: asteroid.close_approach_data[0].miss_distance.kilometers,
                date: asteroid.close_approach_data[0].close_approach_date
            });
        });
    }

    neoObjects.sort((a, b) => new Date(a.date) - new Date(b.date));

    return neoObjects;
}

function populateNeoList(neoObjects) {
    const neoList = document.getElementById("neo-list");
    
    neoObjects.reverse().forEach((neo) => {
        const listItem = document.createElement("li");
        listItem.textContent = neo.name;
        listItem.onclick = () => {
            updateVisualization(neo);
            document.getElementById("description").style.display = 'none';
        };
        neoList.appendChild(listItem);
    });
}

function updateVisualization(neo) {
    const scaleHeight = 730;
    const humanHeightInMeters = 0.018;

    let maxScaleDistance;
    if (neo.diameter < 1) {
        maxScaleDistance = 1;
    } else if (neo.diameter < 10) {
        maxScaleDistance = 10;
    } else {
        maxScaleDistance = 100;
    }

    const scaleFactor = scaleHeight / maxScaleDistance;

    const neoSvg = d3.select("#neo-svg");
    const humanSvg = d3.select("#human-svg");

    const svgHeight = parseFloat(neoSvg.style("height"));

    const neoRadius = (neo.diameter * scaleFactor) / 2;
    const neoYPosition = svgHeight - neoRadius * 2;

    neoSvg.selectAll("circle")
        .data([neo])
        .join("circle")
        .transition()
        .duration(750)
        .attr("cx", neoRadius)
        .attr("cy", neoYPosition + neoRadius)
        .attr("r", neoRadius)
        .attr("fill", "gray");

    document.getElementById("neo-name").textContent = neo.name;

    const diameterDisplay = neo.diameter < 1 
        ? `${(neo.diameter * 1000).toFixed(2)} m`
        : `${neo.diameter.toFixed(2)} km`;

    const neoDataList = document.getElementById("neo-data-list");
    d3.select(neoDataList).selectAll("li")
        .data([
            `Diameter: ${diameterDisplay}`,
            `Velocity: ${neo.velocity} km/h`,
            `Miss Distance: ${neo.missDistance} km`,
            `Close Approach Date: ${neo.date}`
        ])
        .join("li")
        .text(d => d)
        .style("opacity", 0)
        .transition()
        .duration(750)
        .style("opacity", 1);

    const humanHeight = humanHeightInMeters * scaleFactor;
    humanSvg.transition()
        .duration(750)
        .attr("width", humanHeight * 0.4)
        .attr("height", humanHeight);

    addScaleBreakpoints(maxScaleDistance, scaleHeight);
}

function addScaleBreakpoints(maxScaleDistance, scaleHeight) {
    const scaleSvg = d3.select("#scale-svg")
        .attr("viewBox", `0 -10 80 ${scaleHeight + 20}`)
        .attr("preserveAspectRatio", "xMidYMid meet");

    scaleSvg.selectAll("*").remove();

    let breakpoints;
    if (maxScaleDistance === 1) {
        breakpoints = [0, 0.25, 0.5, 0.75, 1];
    } else if (maxScaleDistance === 10) {
        breakpoints = [0, 2.5, 5, 7.5, 10];
    } else {
        breakpoints = [0, 25, 50, 75, 100];
    }

    const yScale = d3.scaleLinear()
        .domain([0, maxScaleDistance])
        .range([scaleHeight, 0]);

    breakpoints.forEach(bp => {
        scaleSvg.append("line")
            .attr("x1", 0)
            .attr("x2", 0)
            .attr("y1", yScale(bp))
            .attr("y2", yScale(bp))
            .attr("stroke", "#17f700")
            .attr("stroke-width", 2)
            .transition()
            .duration(750)
            .attr("x2", 20);

        scaleSvg.append("text")
            .attr("x", 0)
            .attr("y", yScale(bp) + 5)
            .attr("opacity", 0)
            .transition()
            .duration(750)
            .attr("x", 25)
            .attr("opacity", 1)
            .text(maxScaleDistance === 1 ? `${bp * 1000} m` : `${bp} km`)
            .attr("fill", "#17f700")
            .attr("font-size", "12px")
            .attr("alignment-baseline", "middle");
    });
}