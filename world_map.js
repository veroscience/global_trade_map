var map_svg = d3.select("#map_id").append("svg").attr("width", "100%").attr("height", "100%")
var map_svg_rect=map_svg.node().getBoundingClientRect();
var map_width=map_svg_rect.width
var map_height=map_svg_rect.height
var transform;

// Define a projection
var projection = d3.geoMercator()  // you could use different projections such as geoOrthographic, geoAlbers, etc.
    .scale(170)  // this is like zooming: higher values zoom in, lower values zoom out
    .translate([map_width*0.45, map_height *0.65]);  // centre the map in the middle of the SVG
// Define a path generator using the projection
var path = d3.geoPath()
    .projection(projection);

var tooltip = d3.select("#map_id")
     .append('div')
    .attr("class", "tooltip")


// Load in GeoJSON data

d3.json("data/world-110m2.json")
    .then(function(data) {
        // Bind the data and create one path per GeoJSON feature
        map_svg.append("g").attr("id", "path").selectAll("path")
            .data(topojson.feature(data, data.objects.countries).features)  
            .enter()
            .append("path")
            .attr("d", path)
            .style("fill", "#F2E9E4")
            .style("stroke", "#22223b")
            .style("stroke-width", "1px")

            d3.select('#loadingSpinner').style('display', 'block');
            })
    .catch(function(error){
        throw error;
    });

// Define zoom function

var current_x;
var current_scale;

var zoom = d3.zoom()
    .scaleExtent([1, 8])  // This controls how far you can zoom out (1) and in (8) 
    .on('zoom', function() {
        // On zoom, adjust the paths and any other elements you want to zoom
        transform=d3.event.transform
   
            map_svg .selectAll('path')
            .filter(function() {
     return this.parentNode.nodeName!='marker'
   }) 
       .attr('transform', transform);   

       console.log('transform', transform)  
      

    })
    ;

// Apply the zoom behavior to your svg
map_svg.call(zoom);

d3.select("#resetZoom").on("click", function() {
map_svg.call(zoom.transform, d3.zoomIdentity)

projection = d3.geoMercator()  // you could use different projections such as geoOrthographic, geoAlbers, etc.
.scale(170)  // this is like zooming: higher values zoom in, lower values zoom out
.translate([map_width*0.45, map_height *0.65]);
})

map_svg.on("click", handleClick);

// Mouse click event handler
function handleClick() {
  // Get the mouse coordinates relative to the container
  var mouseCoordinates = d3.mouse(this);
  var mouseX = mouseCoordinates[0];
  var mouseY = mouseCoordinates[1];

  // Create the inverse projection and retrieve the longitude and latitude values
  var inverseProjection = projection.invert([mouseX, mouseY]);
  var longitude = inverseProjection[0];
  var latitude = inverseProjection[1];

  // Use the longitude and latitude values as desired
  console.log("Latitude:", latitude, "Longitude:", longitude);
}