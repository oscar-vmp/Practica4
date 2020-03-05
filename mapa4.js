Promise.all([
  d3.csv(
    "https://gist.githubusercontent.com/oscar-vmp/7d87376c4a324f2d68fec1d1407f09a9/raw/1697763d2e8de61df2c70849077e5297cb08900b/Viviendas.csv"
  ),
  d3.csv(
    "https://gist.githubusercontent.com/oscar-vmp/7d87376c4a324f2d68fec1d1407f09a9/raw/1697763d2e8de61df2c70849077e5297cb08900b/PrecioMedio.csv"
  ),
  d3.json(
    "https://gist.githubusercontent.com/miguepiscy/2d431ec3bc101ef62ff8ddd0e476177f/raw/2482274db871e60195b7196c602700226bdd3a44/practica.json"
  )
]).then(([csvViviendas, csvPrecios, featureCollection]) => {
  console.log(csvViviendas);
  drawMap(featureCollection, csvPrecios, csvViviendas);
});

function drawMap(featureCollection, csvPrecios, csvViviendas) {
  const rowByID = csvPrecios.reduce((acumulator, d) => {
    // console.log( +d.PrecioMedio);
    acumulator[d.Barrio] = Math.floor(+d.PrecioMedio);
    return acumulator;
  }, {});

  const svg = d3.select("#mapa").append("svg");

  const svgGrafica = d3.select("#grafica").append("svg");

  const widthTotal = 1000;
  const width = 550;
  const height = 700;
  const reduceSize = 25;
  svg.attr("width", width).attr("height", height);
  svgGrafica.attr("width", widthTotal - width).attr("height", height);

  const center = d3.geoCentroid(featureCollection);
  const projection = d3
    .geoMercator()
    //.scale(10000)
    .fitSize([width - reduceSize, height - reduceSize], featureCollection)
    .center(center)
    .translate([width / 2, height / 2]);

  const pathProjection = d3.geoPath().projection(projection);

  const features = featureCollection.features;

  const colorScale = d3.scaleThreshold();

  const color = d3.scaleThreshold(
    [30, 60, 90, 120, 150, 180, 210, 250],
    d3.schemeYlOrBr[9]
  );

  const legend = d3
    .legendColor()
    .labelFormat(d3.format(".0f"))
    .labels(d3.legendHelpers.thresholdLabels)
    // .useClass(true)
    .scale(color);
  const groupMap = svg.append("g").attr("class", "map");
  const groupMapGrafica = svgGrafica.append("g").attr("class", "grafica");

  const backgroundRect = groupMap
    .selectAll("rect")
    .data([null])
    .enter()
    .append("rect")
    .attr("width", 540)
    .attr("height", 690)
    .attr("class", "rectangulo")
    .attr("rx", 15);
  groupMap
    .append("g")
    .attr("transform", "translate(420,20)")
    .call(legend);
  const text = groupMap
    .append("text")
    .attr("x", 20)
    .attr("y", 30)
    .attr("class", "textoBarrio")
    .text("Barrios de Madrid");

  const textPrecio = groupMap
    .append("text")
    .attr("x", 20)
    .attr("y", 50)
    .attr("class", "textoPrecioBarrio")
    .text("");

  const backgroundRectGrafica = groupMapGrafica
    .selectAll("rect")
    .data([null])
    .enter()
    .append("rect")
    .attr("width", 440)
    .attr("height", 690)
    .attr("class", "rectanguloGrafica")
    //   .attr('x',200)
    //   .attr('y',130)
    .attr("rx", 15);

  const textGrafica = groupMapGrafica
    .append("text")
    .attr("x", 50)
    .attr("y", 40)
    .attr("class", "textoBarrioGrafica")
    .text("Barrios de Madrid");

  const subunitsPath = groupMap
    .selectAll(".subunits")
    .data(features)
    .enter()
    .append("path")
    .attr("fill", d => color(rowByID[d.properties.name]))
    .attr("class", "barrio");
  subunitsPath.attr("d", d => pathProjection(d));

  subunitsPath
    .append("title")
    .text(d =>
      typeof rowByID[d.properties.name] === "undefined"
        ? `${d.properties.name}`
        : `${d.properties.name} \nPrecio medio: ${rowByID[d.properties.name]} €`
    );

  subunitsPath.on("click", function clickSubunit(d) {
    console.log(d.properties.name);

    const barrioSeleccionado = d.properties.name;

    const viviendasBarrio = csvViviendas.filter(
      viviendas => viviendas.Barrio == barrioSeleccionado
    );

    drawGrafica(barrioSeleccionado, viviendasBarrio, groupMapGrafica);
  });

  subunitsPath.on("mouseout", function clickSubunit(d) {
    d3.select(".textoBarrio").text("Barrios de Madrid");
    d3.select(".textoPrecioBarrio").text("");
  });

  subunitsPath.on("mouseover", function clickSubunit(d) {
    d3.select(".textoBarrio").text(`${d.properties.name}`);
    d3.select(".textoPrecioBarrio").text(
      typeof rowByID[d.properties.name] === "undefined"
        ? ``
        : `Precio medio: ${rowByID[d.properties.name]} €`
    );
  });
  groupMapGrafica.attr("transform", `translate(3, 3)`);
  groupMap.attr("transform", `translate(3, 3)`);
  /*
  groupMap.call(
    d3.zoom().on("zoom", () => {
      console.log("zoom");
      subunitsPath.attr("transform", d3.event.transform);
    })
  );*/
}
function drawGrafica(barrio, viviendasBarrio, groupMapGrafica) {
  d3.select(".textoBarrioGrafica").text(barrio);
  viviendasBarrio.forEach(d => {
    d.Viviendas = +d.Viviendas;
  });

  const width = d3.select(".rectanguloGrafica").attr("width");
  const height = d3.select(".rectanguloGrafica").attr("height");
  const margin = { top: 100, right: 20, bottom: 80, left: 50 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  const xvalue = d => d.Habitaciones;
  const yValue = d => d.Viviendas;

  const xScale = d3
    .scaleBand()
    .domain(viviendasBarrio.map(xvalue))
    .range([0, innerWidth])
    .padding(0.2);

  const yScale = d3
    .scaleLinear()
    .domain([0, d3.max(viviendasBarrio, yValue)])
    .range([innerHeight, 0]);

  groupMapGrafica
    .selectAll(".axisX")
    .remove()
    .exit();

  groupMapGrafica
    .selectAll(".axisY")
    .remove()
    .exit();

  groupMapGrafica
    .append("g")
    .attr("class", "axisY")
    .call(
      d3
        .axisLeft(yScale)
        .tickSize(-innerWidth, 0, 0)
        .tickSizeOuter(0)
    )
    .attr("transform", `translate(${margin.left},${margin.top})`);

  groupMapGrafica
    .append("g")
    .attr("class", "axisX")
    .call(d3.axisBottom(xScale))
    .attr("transform", `translate(${margin.left},${height - margin.bottom})`);

  groupMapGrafica
    .append("text")
    .attr("class", "textoEje")
    .attr("x", -(innerHeight / 2) - margin.left)
    .attr("y", margin.left / 2.4)
    .attr("transform", "rotate(-90)")
    .text("Nº de viviendas");

  groupMapGrafica
    .append("text")
    .attr("class", "textoEje")
    .attr("y", height - margin.bottom + 35)
    .attr("x", innerWidth / 2.3 + margin.left)
    .text("Nº habitaciones");

  groupMapGrafica.selectAll(".valorDato").remove();

  const grafica = groupMapGrafica
    .selectAll(".barraVivienda")
    .remove()
    .exit()
    .data(viviendasBarrio);

  const textValor = groupMapGrafica
    .selectAll(".valorDato")
    .remove()
    .data(viviendasBarrio)
    .enter()
    .append("text")
    .attr("class", "valorDato");

  grafica
    .enter()
    .append("rect")
    .attr("class", "barraVivienda")
    .attr("x", d => margin.left)
    .attr("y", d => height - margin.bottom)
    .attr("height", 0)
    .transition()
    .duration(750)
    .delay(function(d, i) {
      return i * 150;
    })
    .attr("x", d => xScale(xvalue(d)))
    .attr("width", xScale.bandwidth())
    .attr("y", d => yScale(yValue(d)))
    .attr("height", d => innerHeight - yScale(yValue(d)))
    .attr("transform", `translate(${margin.left},${margin.top})`);

  textValor
    .text(d => yValue(d))
    .attr(
      "x",
      (d, i) => margin.left + xScale(xvalue(d)) + xScale.bandwidth() / 2
    )
    .attr("y", d => yScale(yValue(d)) + margin.bottom + margin.top / 7)
    .attr("text-anchor", "middle");
}
