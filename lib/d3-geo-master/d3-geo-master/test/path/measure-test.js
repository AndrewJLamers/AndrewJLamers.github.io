var tape = require("tape"),
    d3_geo = require("../../");

tape("geoPath.measure(…) of a Point", function(test) {
  test.equal(d3_geo.geoPath().measure({
    type: "Point",
    coordinates: [0, 0]
  }), 0);
  test.end();
});

tape("geoPath.measure(…) of a MultiPoint", function(test) {
  test.equal(d3_geo.geoPath().measure({
    type: "Point",
    coordinates: [[0, 0], [0, 1], [1, 1], [1, 0]]
  }), 0);
  test.end();
});

tape("geoPath.measure(…) of a LineString", function(test) {
  test.equal(d3_geo.geoPath().measure({
    type: "LineString",
    coordinates: [[0, 0], [0, 1], [1, 1], [1, 0]]
  }), 3);
  test.end();
});

tape("geoPath.measure(…) of a MultiLineString", function(test) {
  test.equal(d3_geo.geoPath().measure({
    type: "MultiLineString",
    coordinates: [[[0, 0], [0, 1], [1, 1], [1, 0]]]
  }), 3);
  test.end();
});

tape("geoPath.measure(…) of a Polygon", function(test) {
  test.equal(d3_geo.geoPath().measure({
    type: "Polygon",
    coordinates: [[[0, 0], [0, 1], [1, 1], [1, 0], [0, 0]]]
  }), 4);
  test.end();
});

tape("geoPath.measure(…) of a Polygon with a hole", function(test) {
  test.equal(d3_geo.geoPath().measure({
    type: "Polygon",
    coordinates: [[[-1, -1], [-1, 2], [2, 2], [2, -1], [-1, -1]], [[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]]
  }), 16);
  test.end();
});

tape("geoPath.measure(…) of a MultiPolygon", function(test) {
  test.equal(d3_geo.geoPath().measure({
    type: "MultiPolygon",
    coordinates: [[[[-1, -1], [-1, 2], [2, 2], [2, -1], [-1, -1]]], [[[0, 0], [0, 1], [1, 1], [1, 0], [0, 0]]]]
  }), 16);
  test.end();
});
