//Andrew Lamers - GEOG575

(function () {
//Plug CSV attributes into Variables
    var attrArray = ["2006","2007","2008","2009","2010","2011","2012","2013","2014","2015","2016"];
    var expressed = attrArray[0];
	var expressed2 = attrArray[0];
	var expressed3 = attrArray[0];
	var expressed4 = attrArray[0];

//Chart frame dimensions
    var chartWidth = window.innerWidth * 0.50,
        chartHeight = 500,
        leftPadding = 50,
        rightPadding = 2,
        topBottomPadding = 10,
        chartInnerWidth = chartWidth - leftPadding - rightPadding,
        chartInnerHeight = chartHeight - topBottomPadding * 2,
        translate = "translate(" + leftPadding + "," + topBottomPadding + ")";
	var chartWidth2 = window.innerWidth * 0.32,
        chartHeight2 = 375,
        leftPadding2 = 50,
        rightPadding2 = 2,
        topBottomPadding2 = 10,
        chartInnerWidth2 = chartWidth2 - leftPadding2 - rightPadding2,
        chartInnerHeight2 = chartHeight2 - topBottomPadding2 * 2,
        translate2 = "translate(" + leftPadding2 + "," + topBottomPadding2 + ")";
	var chartWidth3 = window.innerWidth * 0.32,
        chartHeight3 = 375,
        leftPadding3 = 50,
        rightPadding3 = 2,
        topBottomPadding3 = 10,
        chartInnerWidth3 = chartWidth3 - leftPadding3 - rightPadding3,
        chartInnerHeight3 = chartHeight3 - topBottomPadding3 * 2,
        translate3 = "translate(" + leftPadding3 + "," + topBottomPadding3 + ")";
	var chartWidth4 = window.innerWidth * 0.32,
        chartHeight4 = 375,
        leftPadding4 = 50,
        rightPadding4 = 2,
        topBottomPadding4 = 10,
        chartInnerWidth4 = chartWidth4 - leftPadding4 - rightPadding4,
        chartInnerHeight4 = chartHeight4 - topBottomPadding4 * 2,
        translate4 = "translate(" + leftPadding4 + "," + topBottomPadding4 + ")";
    
//Create a scale to size bars proportionally to frame and for axis
        var yScale = d3.scaleLinear()
        .range([chartHeight, 0])
        .domain([0, 300]);
		var yScale2 = d3.scaleLinear()
        .range([chartHeight2, 0])
        .domain([0, 260]);
		var yScale3 = d3.scaleLinear()
        .range([chartHeight3, 0])
        .domain([0, .55]);
		var yScale4 = d3.scaleLinear()
        .range([chartHeight4, 0])
        .domain([0, 80000]);
    
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
            .defer(d3.csv, "data/Breweries.csv")
			.defer(d3.csv, "data/OLS.csv")
			.defer(d3.csv, "data/GiniIndex.csv")
			.defer(d3.csv, "data/MedianIncome.csv")
            .defer(d3.json, "data/states.topojson")
            .await(callback);
    
//Call spatial data and create color scale
        function callback(error, csvData,csvData2,csvData3,csvData4,states) {
        
            setGraticule(map, path);
        
            var usStates =  topojson.feature(states, states.objects.states).features;
        
            usStates = joinData(usStates, csvData,csvData2,csvData3,csvData4);
        
            var colorScale = makeColorScale(csvData);
			var colorScale2 = makeColorScale(csvData2);
			var colorScale3 = makeColorScale(csvData3);
			var colorScale4 = makeColorScale(csvData4);
        
            setEnumerationUnits(usStates, map, path, colorScale);
        
//Add coordinated visualization to the map
            setChart(csvData,colorScale);
			setChart2(csvData2,colorScale2);
			setChart3(csvData3,colorScale3);
			setChart4(csvData4,colorScale4);
        
//Add the dropdown menu to the map
            createDropdown(csvData,csvData2,csvData3,csvData4);        
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
        "#FF964C",
        "#FF6900",
        "#CC5400",
        "#7F3500",
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
function setChart2(csvData2, colorScale2){
    //create a second svg element to hold the bar chart
    var chart2 = d3.select("body")
        .append("svg")
        .attr("width", chartWidth2)
        .attr("height", chartHeight2)
        .attr("class", "chart2");
    
//Create chart background
    var chartBackground2 = chart2.append("rect")
        .attr("class", "chartBackground")
        .attr("width", chartInnerWidth2)
        .attr("height", chartInnerHeight2)
        .attr("transform", translate2);

//Set bars for each province
    var bars2 = chart2.selectAll(".bar2")
        .data(csvData2)
        .enter()
        .append("rect")
        .sort(function(a, b){
            return b[expressed2]-a[expressed2]
        })
        .attr("class", function(d){
            return "bar2 " + d.STATE_ABBR;
        })
        .attr("width", chartInnerWidth2 / csvData2.length - 1)
        .on("mouseover", highlight)
        .on("mouseout", dehighlight)
        .on("mousemove", moveLabel)

    var desc = bars2.append("desc")
            .text('{"stroke": "none", "stroke-width": "90px"}');
    
//Create a text element for the chart title
    var chartTitle2 = chart2.append("text")
        .attr("x", 190)
        .attr("y", 25)
        .attr("class", "chartTitle2");

//Create vertical axis generator
   var yAxis2 = d3.axisLeft(yScale2)
        .scale(yScale2);

//Place axis
    var axis2 = chart2.append("g")
        .attr("class", "axis")
        .attr("transform", translate2)
        .call(yAxis2);

//Create frame for chart border
    var chartFrame2 = chart2.append("rect")
        .attr("class", "chartFrame")
        .attr("width", chartInnerWidth2)
        .attr("height", chartInnerHeight2)
        .attr("transform", translate2);


     updateChart2(bars2, csvData2.length, colorScale2);
        
}
function setChart3(csvData3, colorScale3){
    //create a second svg element to hold the bar chart
    var chart3 = d3.select("body")
        .append("svg")
        .attr("width", chartWidth3)
        .attr("height", chartHeight3)
        .attr("class", "chart3");
    
//Create chart background
    var chartBackground3 = chart3.append("rect")
        .attr("class", "chartBackground")
        .attr("width", chartInnerWidth3)
        .attr("height", chartInnerHeight3)
        .attr("transform", translate3);

//Set bars for each province
    var bars3 = chart3.selectAll(".bar3")
        .data(csvData3)
        .enter()
        .append("rect")
        .sort(function(a, b){
            return b[expressed3]-a[expressed3]
        })
        .attr("class", function(d){
            return "bar3 " + d.STATE_ABBR;
        })
        .attr("width", chartInnerWidth3 / csvData3.length - 1)
        .on("mouseover", highlight)
        .on("mouseout", dehighlight)
        .on("mousemove", moveLabel)

    var desc = bars3.append("desc")
            .text('{"stroke": "none", "stroke-width": "90px"}');
    
//Create a text element for the chart title
    var chartTitle3 = chart3.append("text")
        .attr("x", 305)
        .attr("y", 25)
        .attr("class", "chartTitle3");

//Create vertical axis generator
   var yAxis3 = d3.axisLeft(yScale3)
        .scale(yScale3);

//Place axis
    var axis3 = chart3.append("g")
        .attr("class", "axis")
        .attr("transform", translate3)
        .call(yAxis3);

//Create frame for chart border
    var chartFrame3 = chart3.append("rect")
        .attr("class", "chartFrame")
        .attr("width", chartInnerWidth3)
        .attr("height", chartInnerHeight3)
        .attr("transform", translate3);
        
     updateChart3(bars3, csvData3.length, colorScale3);
        
}
function setChart4(csvData4, colorScale4){
    //create a second svg element to hold the bar chart
    var chart4 = d3.select("body")
        .append("svg")
        .attr("width", chartWidth4)
        .attr("height", chartHeight4)
        .attr("class", "chart4");
    
//Create chart background
    var chartBackground4 = chart4.append("rect")
        .attr("class", "chartBackground")
        .attr("width", chartInnerWidth4)
        .attr("height", chartInnerHeight4)
        .attr("transform", translate4);

//Set bars for each province
    var bars4 = chart4.selectAll(".bar4")
        .data(csvData4)
        .enter()
        .append("rect")
        .sort(function(a, b){
            return b[expressed4]-a[expressed4]
        })
        .attr("class", function(d){
            return "bar4 " + d.STATE_ABBR;
        })
        .attr("width", chartInnerWidth4 / csvData4.length - 1)
        .on("mouseover", highlight)
        .on("mouseout", dehighlight)
        .on("mousemove", moveLabel)

    var desc = bars4.append("desc")
            .text('{"stroke": "none", "stroke-width": "90px"}');
    
//Create a text element for the chart title
    var chartTitle4 = chart4.append("text")
        .attr("x", 245)
        .attr("y", 25)
        .attr("class", "chartTitle4");

//Create vertical axis generator
   var yAxis4 = d3.axisLeft(yScale4)
        .scale(yScale4);

//Place axis
    var axis4 = chart4.append("g")
        .attr("class", "axis")
        .attr("transform", translate4)
        .call(yAxis4);

//Create frame for chart border
    var chartFrame4 = chart4.append("rect")
        .attr("class", "chartFrame")
        .attr("width", chartInnerWidth4)
        .attr("height", chartInnerHeight4)
        .attr("transform", translate4);
        
     updateChart4(bars4, csvData4.length, colorScale4);      
}
	
//Create dropdown from CSV Data
function createDropdown(csvData,csvData2,csvData3,csvData4){
    var dropdown = d3.select("body")
        .append("select")
        .attr("class", "dropdown")
        .on("change", function(){
            changeAttribute(this.value, csvData,csvData2,csvData3,csvData4)
        });

//Add initial option
    var titleOption = dropdown.append("option")
        .attr("class", "titleOption")
        .attr("disabled", "true")
        .text("Select Year");

//Add attribute name options
    var attrOptions = dropdown.selectAll("attrOptions")
        .data(attrArray)
        .enter()
        .append("option")
        .attr("value", function(d){ return d })
        .text(function(d){ return d });
    }
    
function changeAttribute(attribute, csvData,csvData2,csvData3,csvData4){
//Change the expressed attribute
    expressed = attribute;
	expressed2 = attribute;
	expressed3 = attribute;
	expressed4 = attribute;
	
//Recreate the color scale
    var colorScale = makeColorScale(csvData);
	var colorScale2 = makeColorScale(csvData2);
	var colorScale3 = makeColorScale(csvData3);
	var colorScale4 = makeColorScale(csvData4);
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
   var bars2 = d3.selectAll(".bar2")
   //Re-sort bars
        .sort(function(a, b){
            return b[expressed] - a[expressed];
        })
        .transition()
        .delay(function(d, i){
            return i * 20
        })
        .duration(500);
   var bars3 = d3.selectAll(".bar3")
   //Re-sort bars
        .sort(function(a, b){
            return b[expressed] - a[expressed];
        })
        .transition()
        .delay(function(d, i){
            return i * 20
        })
        .duration(500);
   var bars4 = d3.selectAll(".bar4")
   
//Re-sort bars
        .sort(function(a, b){
            return b[expressed] - a[expressed];
        })
        .transition()
        .delay(function(d, i){
            return i * 20
        })
        .duration(500);
	

    updateChart(bars, csvData.length,colorScale);
	updateChart2(bars2, csvData2.length,colorScale2);
	updateChart3(bars3, csvData3.length,colorScale3);
	updateChart4(bars4, csvData4.length,colorScale4);
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
        .text("Brewery Count for Each State (" + [expressed] +")");
}
function updateChart2(bars2, n, colorScale2){
//Position bars
    bars2.attr("x", function(d, i){
            return i * (chartInnerWidth2 / n) + leftPadding2;
        })
//Size and resize bars
        .attr("height", function(d, i){
            return 500 - yScale2(parseFloat(d[expressed2]));
        })
        .attr("y", function(d, i){
            return yScale2(parseFloat(d[expressed2])) + topBottomPadding2;
        })
//Color and recolor bars
        .style("fill", function(d){
            return choropleth(d, colorScale2);
        });

//Add text to chart title
    var chartTitle2 = d3.select(".chartTitle2")
        .text("Expected Brewery Count for Each State (" + [expressed2] +")");
}
function updateChart3(bars3, n, colorScale3){
//Position bars
    bars3.attr("x", function(d, i){
            return i * (chartInnerWidth3 / n) + leftPadding3;
        })
//Size and resize bars
        .attr("height", function(d, i){
            return 500 - yScale3(parseFloat(d[expressed3]));
        })
        .attr("y", function(d, i){
            return yScale3(parseFloat(d[expressed3])) + topBottomPadding3;
        })
//Color and recolor bars
        .style("fill", function(d){
            return choropleth(d, colorScale3);
        });

//Add text to chart title
    var chartTitle3 = d3.select(".chartTitle3")
        .text("Gini Index for Each State (" + [expressed3] +")");
}
function updateChart4(bars4, n, colorScale4){
//Position bars
    bars4.attr("x", function(d, i){
            return i * (chartInnerWidth4 / n) + leftPadding4;
        })
//Size and resize bars
        .attr("height", function(d, i){
            return 500 - yScale4(parseFloat(d[expressed4]));
        })
        .attr("y", function(d, i){
            return yScale4(parseFloat(d[expressed4])) + topBottomPadding4;
        })
//Color and recolor bars
        .style("fill", function(d){
            return choropleth(d, colorScale4);
        });

//Add text to chart title
    var chartTitle4 = d3.select(".chartTitle4")
        .text("Median Income($) for Each State (" + [expressed4] + ")");
	}  
	
//Highlight enumeration units and bars
function highlight(props){

//Highlight stroke
    var selected = d3.selectAll("." + props.STATE_ABBR)
        .style("stroke", "lightgreen")
        .style("stroke-width", "4");
    setLabel(props);
}
    
//Create dynamic label
function setLabel(props){
//Label content
    var labelAttribute = "<h1>" + props[expressed] +"</h1>";

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
