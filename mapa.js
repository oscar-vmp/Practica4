d3.json(
  "https://gist.githubusercontent.com/miguepiscy/2d431ec3bc101ef62ff8ddd0e476177f/raw/2482274db871e60195b7196c602700226bdd3a44/practica.json"
).then(featureCollection => {
  drawMap(featureCollection);
});

function drawMap(featureCollection) {
  const svg = d3.select("#prueba").append("svg");

  const width = 1000;
  const height = 1000;
  svg.attr("width", width).attr("height", height);

  const center = d3.geoCentroid(featureCollection);
  const projection = d3
    .geoMercator()
    //.scale(10000)
    .fitSize([width - 150, height - 150], featureCollection)
    .center(center)
    .translate([width / 2, height / 2]);

  const pathProjection = d3.geoPath().projection(projection);

  const features = featureCollection.features;

  const groupMap = svg.append("g").attr("class", "map");
  const subunitsPath = groupMap
    .selectAll(".subunits")
    .data(features)
    .enter()
    .append("path")
    .attr("class", "barrio");
  subunitsPath.attr("d", d => pathProjection(d));

  subunitsPath.append("title").text(d => d.properties.name);

  svg.call(
    d3.zoom().on("zoom", () => {
      // console.log("zoom");
      subunitsPath.attr("transform", d3.event.transform);
    })
  );
}
