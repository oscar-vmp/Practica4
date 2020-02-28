// Instalar Gdal (mac: brew intall gdal)
// sacar geojson de shp
// ogr2ogr -f GeoJson spain.json spain.shp
// ogr2ogr -f GeoJson canarias.json canarias.shp

//  mezclar  dos geojson
// npm install -g topojson (instalar node.js) => solo para uniones
// topojson spain.json canarias.json -o full_spain.json

// d3.json('api')
//   .then((featureCollection) => {
//     d3.csv('vuestro csv')
//       .then((csv) => {
//         drawMap(featureCollection, csv);
//         //  dentro csv[name] => precio
//       })
//   })

// Si quisieramos hacer regresión lineal
// const linearRegression = ss.linearRegression(pairs);
// const linearRegressionLine = ss.linearRegressionLine(linearRegression);

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
    // .scale(100000)
    .fitSize([width, height], featureCollection)
    .center(center)
    .translate([width / 2, height / 2]);

  const pathProjection = d3.geoPath().projection(projection);

  const features = featureCollection.features;

  const groupMap = svg.append("g").attr("class", "map");
  const subunitsPath = groupMap
    .selectAll(".subunits")
    .data(features)
    .enter()
    .append("path");

  subunitsPath.attr("d", d => {
    d.opacity = 1;
    return pathProjection(d);
  });
  subunitsPath.on("click", function clickSubunit(d) {
    d.opacity = d.opacity ? 0 : 1;
    d3.select(this).attr("opacity", d.opacity);
    console.log(d.properties.name);
  });

  const color = d3.scaleOrdinal(d3.schemeCategory10);

  subunitsPath.attr("fill", d => color(d.properties.name));

  const legend = svg.append("g").attr("class", "legend");

  // d3.legendcolor
  const numberOfLegends = 5;

  const scaleLegend = d3
    .scaleLinear()
    .domain([0, numberOfLegends])
    .range([0, width]);

  for (let index = 0; index < numberOfLegends; index += 1) {
    const posX = scaleLegend(index);

    const legendGroup = legend
      .append("g")
      .attr("transform", `translate(${posX}, 0)`);
    // d3.interpolateViridis
    const rectColor = legendGroup.append("rect");
    const widthRect = width / numberOfLegends - 2;
    rectColor
      .attr("width", widthRect)
      .attr("height", 15)
      .attr("fill", color(index));
  }
}
