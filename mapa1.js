Promise.all([
    d3.csv("https://gist.githubusercontent.com/oscar-vmp/7d87376c4a324f2d68fec1d1407f09a9/raw/1697763d2e8de61df2c70849077e5297cb08900b/Viviendas.csv"),
    d3.csv("https://gist.githubusercontent.com/oscar-vmp/7d87376c4a324f2d68fec1d1407f09a9/raw/1697763d2e8de61df2c70849077e5297cb08900b/PrecioMedio.csv"),
    d3.json(
      "https://gist.githubusercontent.com/miguepiscy/2d431ec3bc101ef62ff8ddd0e476177f/raw/2482274db871e60195b7196c602700226bdd3a44/practica.json"
    )
  ]).then(([csvViviendas,csvPrecios, featureCollection]) => {
    //console.log(csvViviendas)
    drawMap(featureCollection,csvPrecios);
  });
  
  
  
  function drawMap(featureCollection,csvPrecios) {
  
   
    //const rowByID = csvPrecios.reduce((acumulator, d ) => {
     // console.log( +d.PrecioMedio);
     // acumulator[d.Barrio]=+d.PrecioMedio;
    //  return acumulator;
    //}, {} );
  
    const rowByID = {};
  
    csvPrecios.forEach(d => {
      rowByID[d.Barrio]=Math.floor(+d.PrecioMedio)})  ;
    //console.log(rowByID);
    const svg = d3.select("#prueba").append("svg");
  
    const width = 1200;
    const height = 1000;
    svg.attr("width", width).attr("height", height);
  
    const center = d3.geoCentroid(featureCollection);
    const projection = d3
      .geoMercator()
      //.scale(10000)
      .fitSize([width - 350, height - 350], featureCollection)
      .center(center)
      .translate([width / 2, height / 2]);
  
    const pathProjection = d3.geoPath().projection(projection);
  
    const features = featureCollection.features;
  
    const colorScale = d3.scaleThreshold();
  
    const color = d3.scaleThreshold([0,30,60,90,120,150,180,210,250,280], d3.schemeYlOrBr[9])
    
  
    
    
    const colorValue = d => +rowByID[d.properties.name];
  
    
   
    //const colorValue= d
    // console.log(features.map(colorValue).sort());
    colorScale
      .domain(features.map(colorValue))
     // .domain(features.map(colorValue))
      .range(d3.schemeBlues[9]);
     // .domain(features.map(colorValue).sort().reverse());
     // .domain(colorScale.domain().sort().reverse())
    //  .range(d3.interpolateBlues);
    //  console.log(  colorScale.domain().sort());
     // 
     // ;
    
    const groupMap = svg.append("g").attr("class", "map");
    const groupMapGrafica = svg.append("g").attr("class", "grafica");
    
    const backgroundRect= groupMap
        .selectAll("rect")
        .data([null])
        .enter()
        .append("rect")
        .attr("width",600)
        .attr("height",700)
        .attr("class","rectangulo")
        .attr('x',300)
        .attr('y',130)
        .attr('rx',15);
        
    const text = groupMap.append("text")
        .attr('x', 350)
        .attr('y', 170)
        .attr("class","textoBarrio")
        .text('Barrios de Madrid');
        
    
  const backgroundRectGrafica= groupMapGrafica
        .selectAll("rect")
        .data([null])
        .enter()
        .append("rect")
        .attr("width",550)
        .attr("height",700)
        .attr("class","rectangulo")
     //   .attr('x',200)
     //   .attr('y',130)
        .attr('rx',15);
        const textGrafica = groupMapGrafica.append("text")
        .attr('x', 20)
        .attr('y', 40)
        .attr("class","textoBarrioGrafica")
        .text('Barrios de Madrid');
    

    const subunitsPath = groupMap
      .selectAll(".subunits")
      .data(features)
      .enter()
      .append("path")
      .attr('fill',d => color(rowByID[d.properties.name]))
      .attr("class", "barrio");
    subunitsPath.attr("d", d => pathProjection(d));
  
    //subunitsPath.append("title").text(d => d.properties.name);
    subunitsPath.append("title").text(d => rowByID[d.properties.name]);
  
    subunitsPath.on("click", function clickSubunit(d) {
     // d.opacity = d.opacity ? 0 : 1;
     // d3.select(this).attr("opacity", d.opacity);
      console.log(d.properties.name);
      d3.select('.textoBarrioGrafica').text (d.properties.name);
     // d3.select('.textoBarrio').text (d.properties.name);
    });
   
    subunitsPath.on ('mouseout', function clickSubunit(d) {
        // d.opacity = d.opacity ? 0 : 1;
        // d3.select(this).attr("opacity", d.opacity);
      //   console.log(d.properties.name);
            d3.select('.textoBarrio').text ("Barrios de Madrid");
       })
  
    subunitsPath.on("mouseover", function clickSubunit(d) {
      // d.opacity = d.opacity ? 0 : 1;
      // d3.select(this).attr("opacity", d.opacity);
      // console.log(d.properties.name);
      d3.select('.textoBarrio').text (d.properties.name);
     });
    groupMapGrafica
      .attr('transform', `translate(640, 30)`)
    groupMap
      .attr('transform', `translate(-280, -100)`)
  //
  //  svg.call(
  //    d3.zoom().on("zoom", () => {
        // console.log("zoom");
  //      subunitsPath.attr("transform", d3.event.transform);
  //    })
  //  );
  }
  