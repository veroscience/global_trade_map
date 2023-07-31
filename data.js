
var map_circles;
var value_colors={};
var selected_values;
var year_data;
var circle_color;
var selectedOption="attacktype1_txt";
var add_other=0;
var modal;
var isYearRange=0;
var ratio=1;
var bubble_labels;

var coords={};
var selected_year=2022;
let product_names;

var colorScale= [
    "#4e79a7", "#f28e2b", "#e15759", "#76b7b2", "#59a14f", 
    "#edc948", "#b07aa1", "#ff9da7", "#9c755f", "#bab0ab",
    "#d37295", "#fcb977", "#a39a79", "#9467bd", "#2ca02c", 
    "#98df8a", "#8c564b", "#c49c94", "#e377c2", "#7f7f7f"
  ];

var rename_countries={"Bolivia, Plurinational State of":"Bolivia", "British Virgin Islands":"BVI", "Congo, Democratic Republic of the":"Congo", 
"Falkland Islands (Malvinas)":"Malvinas", "Hong Kong, China":"Hong Kong", "Iran, Islamic Republic of":"Iran",  
"Korea, Democratic People's Republic of":"North Korea", "Korea, Republic of":"South Korea", 
"Lao People's Democratic Republic":"Laos", "Moldova, Republic of":"Moldova", "Russian Federation":"Russia", 
"Syrian Arab Republic":"Syria", "Tanzania, United Republic of":"Tanzania", 
"United Arab Emirates": "UAE", "United Kingdom":"UK", "United States of America":"USA"}

  
let selectedProduct = "00";
function capitalizedWord(word)
{return word.charAt(0).toUpperCase() + word.slice(1);}


d3.csv("data/lat long.csv").then(function(coords_data)
{
    coords_data.forEach((row) => {
  // Extract the necessary values
  const country = row.country;
  const lat = +row.lat_decimal;
  const lon = +row.long_decimal;

  // Add the values to the coords object
  coords[country] = { lat, lon };
});
})

////read in trade data
var new_flows;

d3.json("data/intracen_import.json").then(function(data) {
   // console.log("data", data["China"]['India'])
    flows=calculate_data(data);
    flows=flows.filter(d=>d.value>1000000)

    thicknessScale = d3.scaleLinear()
    .domain([10000000, d3.max(flows.map(d=>d.value))])
    .range([1, width_value]);       

    create_arcs(flows, data)
    filterTopArcs(VolumeSlider.value()*10**6)
var exclude_values=["export", "import", "value in 2022", "Ship stores and bunkers", 'Area Nes', 'Asia not elsewhere specified',
'America not elsewhere specified', 'Europe Othr. Nes', "Free Zones", 'West Asia not elsewhere specified']
    let importers= [...new Set(d3.values(data).map(d=>d3.keys(d)).flat())].sort();
    importers=importers.filter(d=>!exclude_values.includes(d))
    importers.unshift("all countries")
    let exporters= [...new Set(d3.keys(data))].sort();
    exporters= exporters.filter(d=>!exclude_values.includes(d))
    exporters.unshift("all countries")

    
///add product difference data to the tradeflows dataset
/////////

// d3.csv("data/tradeflows_filtered.csv").then(function(tradeflows) {
//   // console.log("data", data["China"]['India'])
//   new_flows = tradeflows.map(function(d) {
//     console.log("tradeflow values d", d.source, d.target)
//    d.value = +d.abs_growth; // Convert the "gross_abs" values to numbers (if they are not numbers already)
//    d.growth = +d.growth
//    delete d.abs_growth; // Remove the old "gross_abs" key

//    try {
// let last_year=d3.max(d3.keys(data[d.source][d.target]['values']))

// d.product=data[d.source][d.target]['product']
// console.log("tradeflow values", d.source, d.target, last_year, d.product.length)

// if(last_year>=2021)
//     {      
     
//     try
//     {
//       d.difference=data[d.source][d.target]['values'][last_year].map((t, i)=>t-(data[d.source][d.target]['values'][2003][i]))
//       console.log("tradeflow values", d.source, d.target, d.difference)
//     }
//     catch(err)
//     {
//       d.difference=Array.from({length:  d.product.length+1 }, () => 0)
//     }

//   }
//   else
//   {
//     d.difference=Array.from({length:  d.product.length+1 }, () => 0)
//   }
// }
// catch(err) {return}

  
//    return d;
//  }); 
//  console.log("new_flows",   new_flows )
// })


///////Dropdowns

// Function to populate the dropdown with options
function populateDropdown(dropdownId, dropdowndata) {
  var dropdown = d3.select("#" + dropdownId)
    .select('select');

  var options = dropdown
    .selectAll('option')
    .data(dropdowndata)
    .enter()
    .append('option')
    .text(function(d) { return d; })
    .attr('value', function(d) { return d; })
    .attr('class', 'dropdown-content');
}

// Call the function to populate each dropdown with its respective data
populateDropdown("export_filter", exporters);
populateDropdown("import_filter", importers);

////Product dropdown
product_values= d3.range(1,100);

d3.csv("data/product_names.csv").then(function(data) { ////upload product names
    product_names = data.reduce((obj, d) => {
             obj[d.category] = d.short_name;
             return obj;
         }, {});
 
         let product_keys=product_values.map(d=>d+". "+product_names[d])
         product_keys.unshift("0. all products")

/////product_filter

populateDropdown("product_filter", product_keys);
 
     });
////////product names end
 


d3.select("#product_filter").on("change", function(d) {
    selectedProduct= d3.select("#product_filter"+' option:checked').text();
    selectedProduct=parseInt(selectedProduct).toString()
    if (selectedProduct.length==1){selectedProduct="0"+selectedProduct}
   /// let product_key = Object.keys(product_names).find(key => product_names[key] === selectedProduct); dont' need anymore as I extract the value
   
    ///change volume slider value to show all arcs
    if (selectedProduct=="00")
    {
        
        VolumeSlider.value(100)

        d3.select("#structure-section").style("display", "block")
        d3.select("#top-exporters-section").style("display", "none")
        d3.select("#top-importers-section").style("display", "none")

    calculate_width(selectedProduct)
    create_arcs(flows, data)
    filterTopArcs(VolumeSlider.value()*10**6) 
    }
    else
    {
        VolumeSlider.value(0.1)
        d3.select("#structure-section").style("display", "none")
        d3.select("#top-exporters-section").style("display", "block")
        d3.select("#top-importers-section").style("display", "block")

    product_flows=calculate_product_data(data, selectedProduct)
    product_flows=product_flows.filter(d=>d.value>VolumeSlider.value()*10**6) 
         ///update stroke width scale 
    calculate_width(selectedProduct)
    ///create arcs
    create_arcs(product_flows, data) 
    
    show_top_exporters()
    show_top_importers()

    }
    //////////

    filter_export(selectedExporter) ///in case an export country is selected
    filter_import(selectedImporter)///in case an export country is selected

   
});

    ///////Sliders

YearSlider.on('end', val => {
    selected_year=val

    ///update flows and arcs
    if (selectedProduct=="00") {
    flows=calculate_data(data);
    flows=flows.filter(d=>d.value>1000000)
///    flows=flows.filter(d=>d.value>VolumeSlider.value()*10**6)
    create_arcs(flows, data)
    filterTopArcs(VolumeSlider.value()*10**6)  ///flows should include all data
    } else
    {   
        product_flows=calculate_product_data(data, selectedProduct)
        product_flows=product_flows.filter(d=>d.value>VolumeSlider.value()*10**6) 
        //      ///update stroke width scale 
        // calculate_width(selectedProduct)
        ///create arcs
        create_arcs(product_flows, data)      

    }

    filter_export(selectedExporter) ///in case an export country is selected
    filter_import(selectedImporter)///in case an export country is selected
})

VolumeSlider.on('end', val => {
    map_svg.selectAll(".arc").style("display", "block")
    filter_export(selectedExporter) ///in case an export country is selected
    filter_import(selectedImporter)///in case an export country is selected
    filterTopArcs(VolumeSlider.value()*10**6)
})

}) ///end of data reading

ThicknessSlider.on('end', val => {
    calculate_width(selectedProduct)
    map_svg.selectAll(".arc").style("stroke-width", function(d, i) {return thicknessScale(d.value)});

    width_value=val

})

function calculate_width(selectedProduct) ///width of arrows
{    
    let max_value = selectedProduct=="00"? d3.max(flows.map(d=>d.value)) : d3.max(product_flows.map(d=>d.value))
    let min_value = selectedProduct=="00"? d3.min(flows.map(d=>d.value)) : d3.min(product_flows.map(d=>d.value))
    thicknessScale = d3.scaleLinear()
    .domain([min_value, max_value])
    .range([1, ThicknessSlider.value()]);     
}

////////////////////////////////////////////////////////////////////////////////event listener for the slider

function calculate_data(data)
{
    var arcsData = [];
    Object.entries(data).forEach(([target, partners]) => {
      Object.entries(partners).forEach(([source, values]) => {
        if (["Area Nes", "Europe Othr. Nes", "America not elsewhere specified"].includes(target)) { 
          return; // Skip the iteration if either source or target is "Area NES"
        }

        let value;
        try
           {value = +values['values'][selected_year][0]; /////extract total value for the selected year and each source-target pair
        }
        catch(err) {
          console.log("values", source, target)
            try
            {
              let last_year=selected_year-1
              value = +values['values'][last_year][0]; }
            catch(err)
                {return }
        };

        const arcData = {
         "source": source,
         "target":target,
         "value": value,
        };
        arcsData.push(arcData);
      });
    });
return arcsData

}

function calculate_product_data(data, product_key)
{
    var arcsData = [];
    Object.entries(data).forEach(([target, partners]) => {
      Object.entries(partners).forEach(([source, values]) => {
        let value;
        try
           {product_index=values['product'].indexOf(product_key);
             if(product_index!=-1){product_index=product_index+1}
            value = +values['values'][selected_year][product_index];   /////+1 because the first value is for the World
        }
        catch(err) {
            try
            {value = +values['values'][selected_year-1][product_index]; }
            catch(err)
                {return }
        };

        const arcData = {
         "source": source,
         "target":target,
         "value": value,
        };
        arcsData.push(arcData);
      });
    });
return arcsData

}

var originalColor;
var thicknessScale;
//// function create_circles()
function create_arcs(flows, data)
    {      
        draw_markers(flows);

        map_svg.selectAll(".arc").remove();    

            
        arcs=map_svg
        .append("g").attr("id", "arcs")
            .selectAll(".arc").data(flows)
                    .enter()
                    
                              
        arcs
                    .append("path")       
                   .attr('class', 'arc')
                    .attr('d', function(d){return drawArc([d.source, d.target, 1])})
                    .attr('id', function(d, i) {return "arc_"+i})
                     .style("stroke-width", function(d, i) {return thicknessScale(d.value)})
                  .style("stroke", function(d, i) {return colorScale[i%20]}) //divde to 10
                  .style("fill", "none") //divde to 10
                    .attr("marker-end", function(d, i) {return "url(#marker_"+i+")"})
                        .on("mouseover", function(d, i){
                            d3.select(this).raise(); // This will bring the arc to the top
                            originalColor = d3.color(d3.select(this).style("stroke")); // Get the original color
                            const brighterColor = d3.hsl(originalColor).brighter(1); // Convert to HSL and make it brighter
                        
                            d3.select(this).style("stroke", brighterColor); // Set the new color

                            ///marker color update
                            d3.select("#marker_"+i).select("path").style("fill", brighterColor)
                        
                 ///add tooltip
            tooltip.html(d.source+"->"+d.target+": " + d3.format('.1f')(d.value/1000000)+" bn USD"); 
            tooltip.style("visibility", "visible")            
           .style("left", (d3.event.pageX + 10) + "px")     
                    .style("top", (d3.event.pageY - 10)  + "px"); 

                    if (data!="")
                    {
                    if (selectedProduct=="00")
                    {show_structure(d.target, d.source, data);
                    }
                   
                    show_trends(d.target, d.source, data)
                  }
                    
            })
                .on("mouseout", function(d,i ){
                    tooltip.style("visibility", "hidden"); 
                    d3.select(this).style("stroke", originalColor); // Set the original color
                    d3.select("#marker_"+i).select("path").style("fill", originalColor)
            
                })

     ////apply existing transform
                map_svg .selectAll('.arc')
                .filter(function() {
         return this.parentNode.nodeName!='marker'
       }) 
           .attr('transform', transform);   
               
            }

///////////

  
function drawArc([sourceName, targetName, angle]) ///source and target are mixed in the formula
{
    angle = angle || 1;

    try
    {
    // If no bend is supplied, then do the plain square root
    
    
    var sourceXY = projection([parseInt(coords[sourceName]['lon']), parseInt(coords[sourceName]['lat'])]),
    targetXY =projection([parseInt(coords[targetName]['lon']), parseInt(coords[targetName]['lat'])]);

   // console.log("projection", [parseInt(coords[targetName]['lon']), parseInt(coords[targetName]['lat'])], targetXY)
			// Uncomment this for testing, useful to see if you have any null lng/lat values
			// if (!targetXY) console.log(d, targetLngLat, targetXY)
			var sourceX = sourceXY[0],
            sourceY = sourceXY[1];

			var targetX = targetXY[0],
            targetY = targetXY[1];

			var dx = targetX - sourceX,
            dy = targetY - sourceY,
            dr = Math.sqrt(dx * dx + dy * dy)*angle;
    
			return "M" + sourceX + "," + sourceY + "A" + dr + "," + dr + " 0 0,1 " + targetX + "," + targetY
    }
    
    catch(err)
    { 
      //console.log("error", sourceName, targetName)
    }
}

var markers;
var marker_enter_path;

function draw_markers(flows)

{
    map_svg.selectAll("marker").remove()
    //////add markers
    
   markers = map_svg.append("defs")
    .selectAll("marker")
     .data(flows).enter()
    
    marker_enter_path  = markers.append('marker')  
      .attr('id', function(d, i) {return "marker_"+i})
      .attr('markerHeight', 2)
      .attr('markerWidth', 2)
    //  .attr('markerUnits', 'strokeWidth')
      .attr('orient', 'auto')
      .attr('refX', 0)
      .attr('refY', 0)
      .attr('viewBox', '-5 -5 10 10')

 marker_enter_path  
      .append('path')
      .attr('d', 'M 0,0 m -5,-5 L 5,0 L -5,5 Z')
        .attr('fill', function(d, i) {return  colorScale[i%20]}) 
    
}


////////add bar chart svg and function
// get the width of the parent element
let parentDiv = d3.select('#column1').node();
let fullWidth = parentDiv.getBoundingClientRect().width;
let  margin = { top: 20, right: 150, bottom: 10, left: 40 };
let width = fullWidth*0.95- margin.left - margin.right, // svg width
    height = 230- margin.top - margin.bottom; // svg height

var bar_svg = d3.select("#bar_chart")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

// create the scales
var y_bar = d3.scaleLinear()
    .range([height, 0]);

var yAxis = bar_svg.append("g")
    .attr("class", "y-axis");

var tooltip = d3.select("body").append("div")
    .style("position", "absolute")
    .style("z-index", "10")
    .style("visibility", "hidden")
    .style("border", "solid")
    .style("border-width", "1px")
    .style("border-radius", "5px")
    .style("background", "whitesmoke")
    .style("padding", "5px")
    .text("a simple tooltip")

////////////////////////////////////////////
///////////////////////SHOW STRUCTURE///////

var entries;
var totalSum;
let bar_values;
let bar_labels

function show_structure(target, source, data)
    {
      if (data!="")
      {
      let last_year;

      if (typeof data[target][source]['values'][selected_year] !== 'undefined')
      {last_year=selected_year}
      else {last_year=selected_year-1}
      
      totalSum = data[target][source]['values'][last_year][0]

  d3.select("#structure_header")
  .html(source+" => "+target+", " +last_year);

  d3.select("#total_header")
  .html("Total: "+ d3.format(".1f")(totalSum/10**6)+" bn USD");

bar_values = data[target][source]['values'][last_year].slice(1);
bar_labels = data[target][source]['product'];

// Calculate the total sum


      } else  /////for selected flows
      {
        let new_flows_values=new_flows.filter(d=>(d.source==source)&(d.target==target))[0]
        d3.select("#structure_header")
        .html(source+" => "+target);
      
        d3.select("#total_header")
        .html("Total: "+ d3.format(".1f")(new_flows_values['value']/10**6)+" bn USD");

        ///new_flows.filter(d=>(d.source==source)&(d.target==target))[0]['value']
        bar_values = data[target][source]['difference'].slice(1);
        bar_labels = data[target][source]['product'];
        

      }

// Create entries array from the values and labels, and then sort 
 entries = Object.entries(bar_values).map(([k, v]) => ({label: product_names[parseInt(bar_labels[k])], value: v}));
entries.sort((a, b) => b.value - a.value || a.label.localeCompare(b.label)); 

// Filter entries to only include the ones that make up 95% of the total sum
let sumSoFar = 0;
var filteredEntries = [];
var remainingEntry = null;

entries.forEach((entry, j) => {
  if (sumSoFar + entry.value <= totalSum * 0.95) {
    sumSoFar += entry.value;
    filteredEntries.push(entry);
  } else if (remainingEntry === null) {
    return;
  }
});

filteredEntries.push({label:"other", value:  totalSum - d3.sum(filteredEntries.map(d=>d.value))})

let cumSum=entries.map((d,i)=>d3.sum(entries.slice(0,i).map(t=>t.value)))
// update scale
y_bar.domain([0,  totalSum]);

// update axis
yAxis.call(d3.axisLeft(y_bar).tickFormat(function(d) { return d / 1e6 + "bn"; }));



let bars = bar_svg.selectAll(".bar")
    .data(entries);  // use labels as keys for data binding

let labels = bar_svg.selectAll(".label")
    .data(entries);

let values = bar_svg.selectAll(".value")
    .data(entries);

bars.exit()
    .transition()
    .duration(500)
    .style("fill-opacity", 1e-6)
    .remove();

labels.exit().transition()
.duration(300).remove();
values.exit().transition()
.duration(300).remove();

bars.enter()
    .append("rect")
    .attr("class", "bar")
    .attr("x", 0)
    .attr("width", width)
    .style("fill", (d, i) => colorScale[i%20])
    .merge(bars)  // merging entered bars with updated ones
    .transition()
    .duration(500)
    .attr("height", (d, i) =>  y_bar(totalSum-d.value)) 
    .attr("y",  (d, i) => y_bar(cumSum[i]+d.value));
    
bars.on("mouseover", function(d) {
    d3.select(this).style("opacity", 0.5)
        return tooltip.style("top", (d3.event.pageY-15)+"px").style("left",(d3.event.pageX+15)+"px").style("visibility", "visible").text(d.label+": "+d3.format(".2f")(d.value/10**6)+"bn$");
    })
    .on("mouseout", function(d) {
        d3.select(this).style("opacity", 1.0)
        return tooltip.style("visibility", "hidden");
    }) ;

// Update selection for labels
labels.attr("x", margin.left + 40) 
    .attr("y", (d,i) => y_bar(cumSum[i]+d.value/2))  // middle of the bar
    .attr("dy", ".35em")
    .text(d => d.value/totalSum > 0.02 ? d.label : "");

// Enter selection for labels
labels.enter().append("text")
    .attr("class", "label")
    .style("font-size", "10px")
    .attr("x", margin.left + 40)  // a little bit to the right from the end of the bar
    .attr("y", (d,i) => y_bar(cumSum[i]+d.value/2))  // middle of the bar
    .attr("dy", ".35em")  // vertical alignment in the middle
    .text(d => d.value/totalSum > 0.02 ? d.label : "");

// Update selection for values
values
.attr("x", margin.left-15)  // middle of the bar
    .attr("y", (d,i) => y_bar(cumSum[i]+d.value/2))  // middle of the bar
    .attr("dy", ".35em")  // vertical alignment in the middle
    .text(d => d.value/totalSum > 0.02 ? (d.value / 10**6).toFixed(1) : "");  // divide by 1 million and keep 2 decimal places

values.enter().append("text")
    .attr("class", "label")
    .style("font-size", "10px")
    .attr("x", margin.left-15)  // middle of the bar
    .attr("y", (d,i) => y_bar(cumSum[i]+d.value/2))  // middle of the bar
    .attr("dy", ".35em")  // vertical alignment in the middle
    .text(d => d.value/totalSum > 0.02 ? (d.value / 10**6).toFixed(1) : "");  // divide by 1 million and keep 2 decimal places

}

///////////show trends 

// Set up the chart dimensions
let  trend_margin = { top: 25, right: 5, bottom: 45, left: 30 };
let trend_width = fullWidth*0.95- trend_margin.left - trend_margin.right, // svg width
trend_height = 120- trend_margin.top - trend_margin.bottom; // svg height

// Extract the years and corresponding y-values for the bar chart
var years = d3.range(2003, 2023); // Generate an array of years from 2013 to 2022
let barWidth = trend_width / years.length;
 
// Create the SVG element for the chart
var trend_svg = d3.select("#trend_chart")
    .append("svg")
    .attr("width", trend_width+trend_margin.left + trend_margin.right)
    .attr("height", trend_height+trend_margin.top + trend_margin.bottom)
    .attr("transform", "translate(0," + trend_margin.top + ")") 
;

 // Define the x-axis and y-axis
 var xAxis = d3.axisBottom()
 .scale(d3.scaleBand().domain(years).range([0, trend_width]))
 .tickFormat(d3.format("d"))
 // Rotate the tick labels
 
 // Create the x-axis
 var xAxisGroup = trend_svg.append("g")
 .attr("transform", "translate(" + trend_margin.left + "," + (trend_height+ trend_margin.top) + ")") 
.call(xAxis);

xAxisGroup.selectAll("text")
  .style("text-anchor", "end")
  .attr("dx", "-.8em")
  .attr("dy", "-0.5em")
  .attr("transform", "rotate(-90)");

  // Hide x-axis
xAxisGroup.style("display", "none");

let g_bars=trend_svg.append("g").attr("id", "bars")
.attr("transform", "translate(" + trend_margin.left + ","+ trend_margin.top +")")

let g_labels = trend_svg.append("g").attr("id", "labels").attr("transform", "translate(" + trend_margin.left + ","+  trend_margin.top+")") 

///////function Show Trends
function show_trends(target, source, data) {  

  d3.select("#trend_header")
  .html(source+" => "+target);
     
if (selectedProduct!="00")
{
  d3.select("#trend_product3").style("display", "block")
  d3.select("#total_trend").style("display", "block")
     
    d3.select("#trend_product3")
    .html(capitalizedWord(product_names[parseInt(selectedProduct)]));

    product_index=data[target][source]['product'].indexOf(selectedProduct);
    if(product_index!=-1){product_index=product_index+1}

    let last_year;

    if (typeof data[target][source]['values'][selected_year] !== 'undefined')
    {last_year=selected_year}
    else {last_year=d3.max(d3.keys(data[target][source]['values']))}

    d3.select("#total_trend")
    .html("Total: "+ d3.format(".1f")(data[target][source]['values'][last_year][product_index]/10**6)+" bn USD");

} else
{
  d3.select("#trend_product3").style("display", "none")
  d3.select("#total_trend").style("display", "none")

}

var values = data[target][source]['values'];


/////Y-axis and scale
// Remove the existing y-axis group
trend_svg.select(".y-axis").remove();
// Remove the existing trend bars
trend_svg.select("g#bars").selectAll(".bar").remove();
// Remove the existing labels
trend_svg.select("g#labels").selectAll(".label").remove();

if (selectedProduct=="00")
{
var yValues = years.map(function(year) {
  try {
    return values[year][0] / 10**6; // Divide the value by 10^6 to convert to desired units
  } catch (err) {
    return 0;
  
}})
}
else
{
      var yValues = years.map(function(year) {
        try {
          return values[year][product_index] / 10**6; // Divide the value by 10^6 to convert to desired units
        } catch (err) {
          return 0;
        
      }})
}
  
  // Create the scaling functions
var yScale = d3.scaleLinear()
    .domain([d3.max(yValues),0]) // Set the domain to the range of yValues
    .range([0,  trend_height]); // Set the range of the scaled values


var yAxis = d3.axisLeft()
 .scale(yScale)
 .ticks(3) // Set the desired number of ticks to 3
 .tickFormat(function(d) {
    if (selectedProduct === "00") {
      return d3.format("d")(d);
    } else {
      return d3.format(".1f")(d);
    }
  }); // Format y-axis ticks with one decimal place

// Create the y-axis
var yAxisGroup = trend_svg.append("g").attr("class", "y-axis")
.attr("transform", "translate(" + trend_margin.left + ","+  trend_margin.top+")") 
 .call(yAxis);

  // Show x-axis
  xAxisGroup.style("display", "block");
//////

let trend_bars = g_bars.selectAll(".bar")
.data(yValues);

//// Create the trend bars
trend_bars
      .enter()
      .append("rect")
      .attr("class", "bar")
      .merge(trend_bars)  // merging entered bars with updated ones
      .transition()
      .duration(500)
      .attr("x", function(d, i) {
        return i * barWidth;
      })
      .attr("y", d=>  yScale(d))
      .attr("width", barWidth - 3)
      .attr("height", function(d) {
        return trend_height - yScale(d); 
      })
      .attr("fill", function (d,i) { if (years[i]!=selected_year) {return "steelblue"} else {return "lightblue"}})

trend_bars.exit()
      .transition()
      .duration(500)
      .remove();
     
//// Create the trend labels
let trend_labels = g_labels.selectAll(".label")
    .data(yValues);


// Enter selection for labels
trend_labels.enter().append("text")
.attr("class", "label")
.merge(trend_labels)
    .transition()
    .duration(500)
    .style("font-size", "10px")
    .attr("y", (d, i) => (i * barWidth) + (barWidth / 2))
    .attr("dy", "0.2em")
    .attr("x", d => -yScale(d) +5)
    .attr("transform", "rotate(-90)") 
    .text(function(value) {if (selectedProduct=="00") {return d3.format("d")(value)} else { return d3.format(".1f")(value)}});

  }

  //////////////////////////////////////////////////////////////
  ////////////////////////////SHOW TOP EXPORTERS AND IMPORTERS

  // Set up the chart dimensions
let  export_margin = { top: 10, right: 30, bottom: 5, left: 80 };
let export_width = fullWidth*0.95-export_margin.left - export_margin.right, // svg width
export_height = 110- export_margin.top - export_margin.bottom; // svg height

// Extract the years and corresponding y-values for the bar chart
var top_length=10
let barHeight =export_height / top_length;
 
// Create the SVG element for the chart
var exporters_svg = d3.select("#bar_chart_exporters")
    .append("svg")
    .attr("width", export_width+export_margin.left + export_margin.right)
    .attr("height", export_height+export_margin.top + export_margin.bottom)
  
;

let g_exporters_bars=exporters_svg.append("g").attr("id", "exporters_bars")
.attr("transform", "translate(" + export_margin.left + ","+ export_margin.top +")")

let g_exporters_labels = exporters_svg.append("g").attr("id", "exporters_labels").attr("transform", "translate(" + export_margin.left + ","+  export_margin.top+")") 


// // Hide y-axis
// yAxisGroup_export.style("display", "none");

var export_data;

d3.json("data/export_values.json").then(function(data) 
{export_data=data;
})

function show_top_exporters() {  
     
    d3.select("#trend_product1")
    .html(capitalizedWord(product_names[parseInt(selectedProduct)])+", "+selected_year+", bn$");

    let countries = Object.keys(export_data[selectedProduct]).map(country => ({ country, values: export_data[selectedProduct][country] }));
    countries=countries.filter(d=>!["World", "1","2"].includes(d.country))

    for (i in countries)
    {countries[i]['values']=countries[i]['values'].map(d=> parseInt(d.replace(/,/g, '')))}
    
    // Sorting the countries based on the last value for Australia (descending order)
    countries_sorted=countries.sort((a, b) => {
      return b.values[selected_year-2003] - a.values[selected_year-2003] ;
    });
    
    // Printing the sorted countries
    export_values=countries_sorted.map(d=>d.values[selected_year-2003]/10**6).slice(0,10)
    export_countries=countries_sorted.map(d=>d.country).slice(0,10)
    export_countries=export_countries.map(function(d) {if (d in rename_countries) {
        return rename_countries[d];
      } else {
        return d;
      }})

console.log("export values", export_values, export_countries)

exporters_svg.select(".y-axis").remove();
// Remove the existing trend bars
exporters_svg.select("g#exporters_bars").selectAll(".bar").remove();
// Remove the existing labels
exporters_svg.select("g#exporters_labels").selectAll(".label").remove();

// Define the x-axis and y-axis
var yAxis_export = d3.axisLeft()
.scale(d3.scaleBand().domain(export_countries).range([0, export_height]).padding(0.1))
// Rotate the tick labels

// Create the x-axis
var yAxisGroup_export = exporters_svg.append("g").attr("class", "y-axis")
.attr("transform", "translate(" + export_margin.left + "," + export_margin.top+ ")") 
.call(yAxis_export);

// Show y-axis
// yAxisGroup_export.style("display", "block");

  // Create the scaling functions
var xScale_export = d3.scaleLinear()
    .domain([0, d3.max(export_values)]) // Set the domain to the range of yValues
    .range([0,  export_width]); // Set the range of the scaled values
console.log("exp width", xScale_export(d3.max(export_values)) )
//////draw the bars

let export_bars = g_exporters_bars.selectAll(".bar")
.data(export_values);

//// Create the trend bars
export_bars
      .enter()
      .append("rect")
      .attr("class", "bar")
      .merge(export_bars)  // merging entered bars with updated ones
      .transition()
      .duration(500)
      .attr("x", 0)
      .attr("y", (d, i)=>  i * barHeight )
      .attr("height", barHeight-2)
      .attr("width", d=>xScale_export(d))
      .attr("fill","steelblue")

export_bars.exit()
      .transition()
      .duration(500)
      .remove();
     
//// Create the trend labels
let export_labels = g_exporters_labels.selectAll(".label")
    .data(export_values);


// Enter selection for labels
export_labels.enter().append("text")
.attr("class", "label")
.merge(export_labels)
    .transition()
    .duration(500)
    .style("font-size", "10px")
    .attr("x",  d=> xScale_export(d)+2)
    .attr("y", (d, i) => (i) * barHeight+1/2* barHeight)
    .attr("dy", "0.2em")
    .text(d => d3.format(".1f")(d));

  }


////////Import bar chart
 // Set up the chart dimensions
 let  import_margin = { top: 10, right: 30, bottom: 5, left: 80 };
 let import_width = fullWidth*0.95-import_margin.left - import_margin.right, // svg width
 import_height = 110- import_margin.top - import_margin.bottom; // svg height
 
 // Extract the years and corresponding y-values for the bar chart
///bar height will be taken from export bar height
  
 // Create the SVG element for the chart
 var importers_svg = d3.select("#bar_chart_importers")
     .append("svg")
     .attr("width", import_width+import_margin.left + import_margin.right)
     .attr("height", import_height+import_margin.top + import_margin.bottom)
   
 ;
 
 let g_importers_bars=importers_svg.append("g").attr("id", "importers_bars")
 .attr("transform", "translate(" + import_margin.left + ","+ import_margin.top +")")
 
 let g_importers_labels = importers_svg.append("g").attr("id", "importers_labels").attr("transform", "translate(" + import_margin.left + ","+  import_margin.top+")") 
 
 
 // // Hide y-axis
 // yAxisGroup_import.style("display", "none");
 
 var import_data;
 
 d3.json("data/import_values.json").then(function(data) 
 {import_data=data;
 })
 
 function show_top_importers() {  
      
     d3.select("#trend_product2")
     .html(capitalizedWord(product_names[parseInt(selectedProduct)])+", "+selected_year+" ,bn$");
 
     let countries = Object.keys(import_data[selectedProduct]).map(country => ({ country, values: import_data[selectedProduct][country] }));
     countries=countries.filter(d=>!["World", "1","2"].includes(d.country))
 
     for (i in countries)
     {countries[i]['values']=countries[i]['values'].map(d=> parseInt(d.replace(/,/g, '')))}
     
     // Sorting the countries based on the last value for Australia (descending order)
     countries_sorted=countries.sort((a, b) => {
       return b.values[selected_year-2003] - a.values[selected_year-2003] ;
     });
     
     // Printing the sorted countries
     import_values=countries_sorted.map(d=>d.values[selected_year-2003]/10**6).slice(0,10)
     import_countries=countries_sorted.map(d=>d.country).slice(0,10)
     import_countries=import_countries.map(function(d) {if (d in rename_countries) {
         return rename_countries[d];
       } else {
         return d;
       }})
 
 console.log("import values", import_values, import_countries)
 
 importers_svg.select(".y-axis").remove();
 // Remove the existing trend bars
 importers_svg.select("g#importers_bars").selectAll(".bar").remove();
 // Remove the existing labels
 importers_svg.select("g#importers_labels").selectAll(".label").remove();
 
 // Define the x-axis and y-axis
 var yAxis_import = d3.axisLeft()
 .scale(d3.scaleBand().domain(import_countries).range([0, import_height]).padding(0.1))
 // Rotate the tick labels
 
 // Create the x-axis
 var yAxisGroup_import = importers_svg.append("g").attr("class", "y-axis")
 .attr("transform", "translate(" + import_margin.left + "," + import_margin.top+ ")") 
 .call(yAxis_import);
 
 // Show y-axis
 // yAxisGroup_import.style("display", "block");
 
   // Create the scaling functions
 var xScale_import = d3.scaleLinear()
     .domain([0, d3.max(import_values)]) // Set the domain to the range of yValues
     .range([0,  import_width]); // Set the range of the scaled values
 console.log("exp width", xScale_import(d3.max(import_values)) )
 //////draw the bars
 
 let import_bars = g_importers_bars.selectAll(".bar")
 .data(import_values);
 
 //// Create the trend bars
 import_bars
       .enter()
       .append("rect")
       .attr("class", "bar")
       .merge(import_bars)  // merging entered bars with updated ones
       .transition()
       .duration(500)
       .attr("x", 0)
       .attr("y", (d, i)=>  i * barHeight )
       .attr("height", barHeight-2)
       .attr("width", d=>xScale_import(d))
       .attr("fill","steelblue")
 
 import_bars.exit()
       .transition()
       .duration(500)
       .remove();
      
 //// Create the trend labels
 let import_labels = g_importers_labels.selectAll(".label")
     .data(import_values);
 
 
 // Enter selection for labels
 import_labels.enter().append("text")
 .attr("class", "label")
 .merge(import_labels)
     .transition()
     .duration(500)
     .style("font-size", "10px")
     .attr("x",  d=> xScale_import(d)+2)
     .attr("y", (d, i) => (i) * barHeight+1/2* barHeight)
     .attr("dy", "0.2em")
     .text(d => d3.format(".1f")(d));
 
   }
 

  ////////end of show bars function


var selectedExporter="all countries";
var selectedImporter="all countries";

///add condition for dropdown
d3.select("#export_filter").on("change", function(d) {
    selectedExporter = d3.select("#export_filter"+' option:checked').text();
    map_svg.selectAll(".arc").style("display", "block")
    filter_import(selectedImporter) //if importer is not selected, that won't be fulfilled
    filter_export(selectedExporter)    
    filterTopArcs(VolumeSlider.value()*10**6)
}
);


function filter_export(selectedExporter)
{       

if (selectedExporter!="all countries")
{
////filter the arcs 
 map_svg.selectAll(".arc").filter(function(d) {
     return d.source!=selectedExporter;
   }).style("display", "none");

}

};


//////////////importers dropdown

d3.select("#import_filter").on("change", function(d) {
    selectedImporter = d3.select("#import_filter"+' option:checked').text();
    map_svg.selectAll(".arc").style("display", "block")
    filter_import(selectedImporter)    
    filter_export(selectedExporter) //if importer is not selected, that won't be fulfilled
    filterTopArcs(VolumeSlider.value()*10**6)
  

});

function filter_import(selectedImporter)
{        
if (selectedImporter!="all countries")
{
////filter the arcs 
 map_svg.selectAll(".arc").filter(function(d) {
     return d.target!=selectedImporter;
   }).style("display", "none");

}
}

///////

function filterTopArcs(threshold) {
    map_svg.selectAll(".arc").filter(function(d) {
        return d.value <threshold;
      }).style("display", "none");

}



// new_flows=new_flows.filter(d=> d.growth>10)

// var abs_growth_threshold=10**6;
// var growth_colorScale;

// function show_filtered_flows(abs_growth_threshold, growth_threshold)
// {
  
//   new_flows_filtered=new_flows.filter(d=> (d.value>abs_growth_threshold)&(d.growth>growth_threshold))

//   create_arcs(new_flows_filtered, "")


//   ///////Recolor the arcs
//      // Define the domain for the color scale

// growth_colorScale = d3.scaleLinear()
//   .domain([0, 0.5,  1].map(q=> d3.quantile(new_flows_filtered.map(d=>d.growth), q)))
//   .range(["orange", "lightgreen" ,"darkgreen"]);

//   map_svg.selectAll(".arc").style("stroke", function(d, i) {
//     let arc_color=growth_colorScale(d.growth)
//     d3.select("#marker_"+i).select("path").style("fill", arc_color)
//     return arc_color})

//  // map_svg.selectAll(".marker").select("path").style("fill", function(d, i) {return d3.select("#arc_"+i).style("stroke")})

//   .on("mouseover", function(d, i){
//     d3.select(this).raise(); // This will bring the arc to the top
//     originalColor = d3.color(d3.select(this).style("stroke")); // Get the original color
//     const brighterColor = d3.hsl(originalColor).brighter(1); // Convert to HSL and make it brighter

//     d3.select(this).style("stroke", brighterColor); // Set the new color

//     ///marker color update
//     d3.select("#marker_"+i).select("path").style("fill", brighterColor)

// /////structure
//     show_structure(d.target, d.source, "")
//     show_trends(d.target, d.source, data)

// ///add tooltip
// tooltip.html(d.source+"->"+d.target+": " + d3.format('.1f')(d.value/1000000)+" bn USD"+", growth:"+d3.format(".1f")(d.growth)); 
// tooltip.style("visibility", "visible")            
// .style("left", (d3.event.pageX + 10) + "px")     
// .style("top", (d3.event.pageY - 10)  + "px"); 

// })
// .on("mouseout", function(d,i ){
//   tooltip.style("visibility", "hidden"); 
//   d3.select(this).style("stroke", originalColor); // Set the original color
//   d3.select("#marker_"+i).select("path").style("fill", originalColor)

// })

//   //divde to 10

// }

////show_filtered_flows()
