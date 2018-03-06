//Create the map
function createMap(){
    //create the map
    var map = L.map('map',{
    center: [20, -00],
    zoom: 2.4,
    minZoom: 2,
    maxZoom: 4,
    zoomControl: true
})

    //I restricted the zoom availability in an attempt to focus the user's goal
    //I wanted a simple basemap and just enough zoom ability to easily see locations of the symbols
    
    //Add custom basemap from mapbox
    L.tileLayer('https://api.mapbox.com/styles/v1/andrewjlamers/cje6jt48r8i7g2rl7wenzgvnx/tiles/256/{z}/{x}/{y}@2x?access_token=pk.eyJ1IjoiYW5kcmV3amxhbWVycyIsImEiOiJjaXNqcmtwOWEwMmtyMnRvY3kxOXQzbGlmIn0.eEJxZgEUsJXVHlUyHOWMdw', {
    attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
    minZoom: 2
}).addTo(map);

    //call getData function
    getData(map);
};

//Create functionality that applies to all features
function onEachFeature(feature, layer) {
    //define text output into the panel
    var panelContent = "<p><b>City:</b> " + feature.properties.City + "</p>";

    //add formatted attribute to panel content string
    var year = attribute.split("_")[1];
    panelContent += "<p><b>Bands formed in" + year + ":</b> " + feature.properties[attribute] + "</p>";

    //popup content is now just the city name
    var popupContent = feature.properties.City;

    //bind the popup to the circle marker
    layer.bindPopup(popupContent, {
        offset: new L.Point(0,-options.radius),
        closeButton: false
    });

    //event listeners to open popup on hover and fill panel on click
    layer.on({
        mouseover: function(){
            this.openPopup();
        },
        mouseout: function(){
            this.closePopup();
        },
        click: function(){
            $("#panel").html(panelContent);
        }
    });
    if (feature.properties) {
        //loop to add feature property names and values to html string
        for (var property in feature.properties){
            popupContent += "<p>" + property + ": " + feature.properties[property] + "</p>";
        }
        layer.bindPopup(popupContent);
    }
}

//Add circle markers for point features to the map
function pointToLayer(feature, latlng, attributes){
    //Assign the current attribute based on the first index of the attributes array
    var attribute = attributes[0];
    
    //create marker options
    if (attribute.includes("bands_")){
        var options = {
        fillColor: "#808080",
        color: "#ff0000",
        weight: 2,
        opacity: 1,
        fillOpacity: 0.7
    }; 
    } else {
        var options = {
        fillColor: "#000000",
        color: "#000000",
        weight: 1,
        opacity: 1,
        fillOpacity: 0
        };
    }  

    //For each feature, determine its value for the selected attribute
    var attValue = Number(feature.properties[attribute]);

    //Give each feature's circle marker a radius based on its attribute value
    options.radius = calcPropRadius(attValue);

    //create circle marker layer
    var layer = L.circleMarker(latlng, options);

    //build popup content string
    var popupContent = "<p><b>City:</b> " + feature.properties.City + "</p><p><b>" + attribute + ":</b> " + feature.properties[attribute] + "</p>";

    //bind the popup to the circle marker
    layer.bindPopup(popupContent, {
        offset: new L.Point(0,-options.radius)
    });

    //event listeners to open popup on hover
    layer.on({
        mouseover: function(){
            this.openPopup();
        },
        mouseout: function(){
            this.closePopup();
        },
        click: function(){
            $("#panel2").html(popupContent)
        }
    });

    //return the circle marker to the L.geoJson pointToLayer option
    return layer;
};

function createPropSymbols(data, map, attributes){
    //create a Leaflet GeoJSON layer and add it to the map
    L.geoJson(data, {
        pointToLayer: function(feature, latlng){
            return pointToLayer(feature, latlng, attributes);
        }
    }).addTo(map);
}

function calcPropRadius(attValue) {
    //scale factor to adjust symbol size evenly
    var scaleFactor = 1.5;
    //area based on attribute value and scale factor
    var area = attValue * scaleFactor;
    //radius calculated based on area
    var radius = Math.sqrt(area/Math.PI);

    return radius;
}

//Create new sequence controls
function createSequenceControls(map){
    //create range input element (slider)     
    $('#panel').append('<input class="range-slider" type="range">');

    //set slider attributes 
    $('.range-slider').attr({
        max: 10, //2000 to 2010
        min: 0,
        value: 0,
        step: 1
    });
}
function processData(data){
    //empty array to hold attributes
    var attributes = [];

    //properties of the first feature in the dataset
    var properties = data.features[0].properties;

    //push each attribute name into attributes array
    for (var attribute in properties){
        
        //only take attributes with values
        if (attribute.indexOf("bands_") >-1){
            attributes.push(attribute);
        }
    }

    //check result
    console.log(attributes);

    return attributes;
}

//Import GeoJSON data
function getData(map){
    //load the data
    $.ajax("data/metal.geojson", {
        dataType: "json",
        success: function(response){
            //create an attributes array
            var attributes = processData(response);

            createPropSymbols(response, map, attributes);
            createSequenceControls(map, attributes);
        }
    });
}
//Create slider buttons
  $('#panel').append('<button class="skip" id="reverse">Reverse</button>');
    $('#panel').append('<button class="skip" id="forward">Skip</button>');
  $('#reverse').html('<img src="img/reverse.png">');
    $('#forward').html('<img src="img/forward.png">');

//Create functionality for buttons

     //Click listener for buttons
    $('.skip').click(function(){
        //get the old index value
        var index = $('.range-slider').val();

        //Increment or decrement depending on button clicked
        if ($(this).attr('id') == 'forward'){
            index++;
        } else if ($(this).attr('id') == 'reverse'){
            index--; 
        }

        //Update slider
        $('.range-slider').val(index);
        
        //New attribute to update symbols
        updatePropSymbols(map, attributes[index]);
        
        
        
//Resize proportional symbols according to new attribute values
function updatePropSymbols(map, attribute){
    map.eachLayer(function(layer){
        
        if (layer.feature && layer.feature.properties[attribute]){
            //access feature properties
            var props = layer.feature.properties;

            //update each feature's radius based on new attribute values
            var radius = calcPropRadius(props[attribute]);
            layer.setRadius(radius);

            //add city to popup content string
            var popupContent = "<p><b>City:</b> " + props.City + "</p>";

            //add formatted attribute to panel content string
            var year = attribute.split("_")[0];
            popupContent += "<p><b>Bands formed in " + year + ":</b> " + props[attribute] + "</p>";

            //replace the layer popup
            layer.bindPopup(popupContent, {
                offset: new L.Point(0,-radius)
            });
        }
    });
}
        
    });

$(document).ready(createMap);