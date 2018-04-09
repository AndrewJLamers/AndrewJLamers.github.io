//Andrew Lamers Lab 2 - GEOG575

(function () {
//Plug CSV attributes into Variables
    var attrArray = ["Teen", "Unmarried", "Pre-term", "Cesarean", "Low Weight"];
    var expressed = attrArray[0];

//Chart frame dimensions
    var chartWidth = window.innerWidth * 0.50,
        chartHeight = 500,
        leftPadding = 25,
        rightPadding = 2,
        topBottomPadding = 5,
        chartInnerWidth = chartWidth - leftPadding - rightPadding,
        chartInnerHeight = chartHeight - topBottomPadding * 2,
        translate = "translate(" + leftPadding + "," + topBottomPadding + ")";

//Create a scale to size bars proportionally to frame and for axis
        var yScale = d3.scaleLinear()
        .range([chartHeight, 0])
        .domain([0, 55]);
    
//Call setMap Function
    window.onload = setMap();

//Set up choropleth map
    function setMap() {
    
//Map frame dimensions
        var width = window.innerWidth * 0.44,
            height = 500;
            
//Create new svg container for the map
        var map = d3.select("body")
            .append("svg")
            .attr("class", "map")
            .attr("width", width)
            .attr("height", height);

//Create Albers equal area conic projection - United States
        var projection = d3.geoAlbers()
            .center([5.45, 38.15])
            .rotate([99.18, 0, 0])
            .parallels([29.5, 45.5])
            .scale(960)
            .translate([width / 2, height / 1.8]);
    
        var path = d3.geoPath()
            .projection(projection);

//Use queue to parallelize asynchronous data loading
        d3.queue()
            .defer(d3.csv, "data/BirthStats.csv")
            .defer(d3.json, "data/states.topojson")
            .await(callback);
    
//Call spatial data and create color scale
        function callback(error, csvData, states) {
        
            setGraticule(map, path);
        
            var usStates =  topojson.feature(states, states.objects.states).features;
        
            usStates = joinData(usStates, csvData);
        
            var colorScale = makeColorScale(csvData);
        
            setEnumerationUnits(usStates, map, path, colorScale);
        
//Add coordinated visualization to the map
            setChart(csvData, colorScale);
        
//Add the dropdown menu to the map
            createDropdown(csvData);        
        }
    }

//Set graticule lines and elements
    function setGraticule(map, path) {
        var graticule = d3.geoGraticule()
            .step([10, 10]);
        
        var gratBackground = map.append("path")
            .datum(graticule.outline()) //bind graticule background
            .attr("class", "gratBackground") //assign class for styling
            .attr("d", path) //project graticule

        
        var gratLines = map.selectAll(".gratLines")
            .data(graticule.lines()) 
            .enter() 
            .append("path") 
            .attr("class", "gratLines") 
            .attr("d", path); 
    }
  
//Join CSV data and Map Elements
    function joinData(usStates, csvData) {
        for (var i=0; i<csvData.length; i++){
        var csvRegion = csvData[i]; 
        var csvKey = csvRegion.STATE_ABBR; 

//Loop search for correct state
        for (var a=0; a<usStates.length; a++){

            var geojsonProps = usStates[a].properties; 
            var geojsonKey = geojsonProps.STATE_ABBR; 

            if (geojsonKey == csvKey){
                attrArray.forEach(function(attr){
                    var val = parseFloat(csvRegion[attr]); 
                    geojsonProps[attr] = val; 
                });
            }
        }
    }
    
  return usStates;  
}
    
function setEnumerationUnits(usStates, map, path, colorScale){
    var regions = map.selectAll(".regions")
        .data(usStates)
        .enter()
        .append("path")
        .attr("class", function(d){
            return "regions " + d.properties.STATE_ABBR;
        })
        .attr("d", path)
        .style("fill", function(d){
            return choropleth(d.properties, colorScale);
        })
        .on("mouseover", function(d){
            highlight(d.properties);
        })
        .on("mouseout", function(d){
            dehighlight(d.properties);
        })
        .on("mousemove", moveLabel);
    
    var desc = regions.append("desc")
        .text('{"stroke": "#999", "stroke-width": "0.7px"}');
}

//Set colors for choropleth map and chart
function makeColorScale(data){
    var colorClasses = [
        "#e6d2f9",
        "#cda5f3",
        "#a862ea",
        "#831fe0",
        "#340c5a"
    ];

//Create color scale generator
    var colorScale = d3.scaleQuantile()
        .range(colorClasses);

//Build array of all values of the expressed attribute
    var domainArray = [];
    for (var i=0; i<data.length; i++){
        var val = parseFloat(data[i][expressed]);
        domainArray.push(val);
    }

//Cluster data using ckmeans clustering algorithm to create natural breaks
    var clusters = ss.ckmeans(domainArray, 5);
//Reset domain array to cluster minimums
    domainArray = clusters.map(function(d){
        return d3.min(d);
    });
//Remove first value from domain array to create class breakpoints
    domainArray.shift();

//Assign array of last 4 cluster minimums as domain
    colorScale.domain(domainArray);

    return colorScale;
    
    
//Attempt at making a dynamic legend for the page
    var colors = d3.scaleQuantize()
    .range(colorbrewer.Greens[7]);
    
    var legend = d3.select('#legend')
        .append('ul')
        .attr('class', 'list-inline');

    var keys = legend.selectAll('li.key')
        .data(colors.range());

    keys.enter().append('li')
        .attr('class', 'key')
        .style('border-top-color', String)
        .text(function(d) {
            var r = colors.invertExtent(d);
            return formats.percent(r[0]);
    });
}

//Set colors    
function choropleth(props, colorScale){
//Make sure attribute value is a number
    var val = parseFloat(props[expressed]);

//If attribute value exists, assign a color; otherwise assign gray
    if (typeof val == 'number' && !isNaN(val)){
        return colorScale(val);
    } else {
        return "#999";
    }
}
    
//Set chart
function setChart(csvData, colorScale){
    //create a second svg element to hold the bar chart
    var chart = d3.select("body")
        .append("svg")
        .attr("width", chartWidth)
        .attr("height", chartHeight)
        .attr("class", "chart");
    
//Create chart background
    var chartBackground = chart.append("rect")
        .attr("class", "chartBackground")
        .attr("width", chartInnerWidth)
        .attr("height", chartInnerHeight)
        .attr("transform", translate);

//Set bars for each province
    var bars = chart.selectAll(".bar")
        .data(csvData)
        .enter()
        .append("rect")
        .sort(function(a, b){
            return b[expressed]-a[expressed]
        })
        .attr("class", function(d){
            return "bar " + d.STATE_ABBR;
        })
        .attr("width", chartInnerWidth / csvData.length - 1)
        .on("mouseover", highlight)
        .on("mouseout", dehighlight)
        .on("mousemove", moveLabel)

    var desc = bars.append("desc")
            .text('{"stroke": "none", "stroke-width": "90px"}');
    
//Create a text element for the chart title
    var chartTitle = chart.append("text")
        .attr("x", 325)
        .attr("y", 50)
        .attr("class", "chartTitle");

//Create vertical axis generator
   var yAxis = d3.axisLeft(yScale)
        .scale(yScale);

//Place axis
    var axis = chart.append("g")
        .attr("class", "axis")
        .attr("transform", translate)
        .call(yAxis);

//Create frame for chart border
    var chartFrame = chart.append("rect")
        .attr("class", "chartFrame")
        .attr("width", chartInnerWidth)
        .attr("height", chartInnerHeight)
        .attr("transform", translate);
        
     updateChart(bars, csvData.length, colorScale);
        
}

//Create dropdown from CSV Data
function createDropdown(csvData){
    var dropdown = d3.select("body")
        .append("select")
        .attr("class", "dropdown")
        .on("change", function(){
            changeAttribute(this.value, csvData)
        });

//Add initial option
    var titleOption = dropdown.append("option")
        .attr("class", "titleOption")
        .attr("disabled", "true")
        .text("Select Attribute");

//Add attribute name options
    var attrOptions = dropdown.selectAll("attrOptions")
        .data(attrArray)
        .enter()
        .append("option")
        .attr("value", function(d){ return d })
        .text(function(d){ return d });
    }
    
function changeAttribute(attribute, csvData){
//Change the expressed attribute
    expressed = attribute;

//Recreate the color scale
    var colorScale = makeColorScale(csvData);

//Recolor enumeration units
    var regions = d3.selectAll(".regions")
        .transition()
        .duration(1000)
        .style("fill", function(d){
            return choropleth(d.properties, colorScale)
        });

   var bars = d3.selectAll(".bar")
//Re-sort bars
        .sort(function(a, b){
            return b[expressed] - a[expressed];
        })
        .transition()
        .delay(function(d, i){
            return i * 20
        })
        .duration(500);

    updateChart(bars, csvData.length, colorScale);
}
    
    function updateChart(bars, n, colorScale){
//Position bars
    bars.attr("x", function(d, i){
            return i * (chartInnerWidth / n) + leftPadding;
        })
//Size and resize bars
        .attr("height", function(d, i){
            return 500 - yScale(parseFloat(d[expressed]));
        })
        .attr("y", function(d, i){
            return yScale(parseFloat(d[expressed])) + topBottomPadding;
        })
//Color and recolor bars
        .style("fill", function(d){
            return choropleth(d, colorScale);
        });

//Add text to chart title
    var chartTitle = d3.select(".chartTitle")
        .text([expressed] + " birth rates in each state");
}
    
//Highlight enumeration units and bars
function highlight(props){

//Highlight stroke
    var selected = d3.selectAll("." + props.STATE_ABBR)
        .style("stroke", "orange")
        .style("stroke-width", "4");
    setLabel(props);
}
    
//Create dynamic label
function setLabel(props){
//Label content
    var labelAttribute = "<h1>" + props[expressed] +"%</h1>";

//Create info label
    var infolabel = d3.select("body")
        .append("div")
        .attr("class", "infolabel")
        .attr("FID", props.STATE_ABBR + "_label")
        .html(labelAttribute);

//Define label content    
    var regionName = infolabel.append("div")
        .attr("class", "labelname")
        .html(props.STATE_NAME);
};

//Reset the element style on mouseout
function dehighlight(props){
    var selected = d3.selectAll("." + props.STATE_ABBR)
        .style("stroke", function(){
            return getStyle(this, "stroke")
        })
        .style("stroke-width", function(){
            return getStyle(this, "stroke-width")
        })
    d3.select(".infolabel")
        .remove();

    function getStyle(element, styleName){
        var styleText = d3.select(element)
            .select("desc")
            .text();

        var styleObject = JSON.parse(styleText);

        return styleObject[styleName];
    }
}
    
//Move info label with mouse
function moveLabel(){
    //get width of label
    var labelWidth = d3.select(".infolabel")
        .node()
        .getBoundingClientRect()
        .width;
    
//Use mousemove event to set label
    var x1 = d3.event.clientX + 10,
        y1 = d3.event.clientY - 75,
        x2 = d3.event.clientX - labelWidth - 10,
        y2 = d3.event.clientY + 25;

//Horizontal label coordinate, testing for overflow
    var x = d3.event.clientX > window.innerWidth - labelWidth - 20 ? x2 : x1; 
//Vertical label coordinate, testing for overflow
    var y = d3.event.clientY < 75 ? y2 : y1; 

    d3.select(".infolabel")
        .style("left", x + "px")
        .style("top", y + "px");
}
    
})();