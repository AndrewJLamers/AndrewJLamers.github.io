var tape = require("tape"),
    array = require("d3-array"),
    d3 = require("../");

tape("a sphere contains any point", function(test) {
  test.equal(d3.geoContains({type: "Sphere"}, [0, 0]), true);
  test.end();
});

tape("a point contains itself (and not some other point)", function(test) {
  test.equal(d3.geoContains({type: "Point", coordinates: [0, 0]}, [0, 0]), true);
  test.equal(d3.geoContains({type: "Point", coordinates: [1, 2]}, [1, 2]), true);
  test.equal(d3.geoContains({type: "Point", coordinates: [0, 0]}, [0, 1]), false);
  test.equal(d3.geoContains({type: "Point", coordinates: [1, 1]}, [1, 0]), false);
  test.end();
});

tape("a MultiPoint contains any of its points", function(test) {
  test.equal(d3.geoContains({type: "MultiPoint", coordinates: [[0, 0], [1,2]]}, [0, 0]), true);
  test.equal(d3.geoContains({type: "MultiPoint", coordinates: [[0, 0], [1,2]]}, [1, 2]), true);
  test.equal(d3.geoContains({type: "MultiPoint", coordinates: [[0, 0], [1,2]]}, [1, 3]), false);
  test.end();
});

tape("a LineString contains any point on the Great Circle path", function(test) {
  test.equal(d3.geoContains({type: "LineString", coordinates: [[0, 0], [1,2]]}, [0, 0]), true);
  test.equal(d3.geoContains({type: "LineString", coordinates: [[0, 0], [1,2]]}, [1, 2]), true);
  test.equal(d3.geoContains({type: "LineString", coordinates: [[0, 0], [1,2]]}, d3.geoInterpolate([0, 0], [1,2])(0.3)), true);
  test.equal(d3.geoContains({type: "LineString", coordinates: [[0, 0], [1,2]]}, d3.geoInterpolate([0, 0], [1,2])(1.3)), false);
  test.equal(d3.geoContains({type: "LineString", coordinates: [[0, 0], [1,2]]}, d3.geoInterpolate([0, 0], [1,2])(-0.3)), false);
  test.end();
});

tape("a MultiLineString contains any point on one of its components", function(test) {
  test.equal(d3.geoContains({type: "MultiLineString", coordinates: [[[0, 0], [1,2]], [[2, 3], [4,5]]]}, [2, 3]), true);
  test.equal(d3.geoContains({type: "MultiLineString", coordinates: [[[0, 0], [1,2]], [[2, 3], [4,5]]]}, [5, 6]), false);
  test.end();
});

tape("a Polygon contains a point", function(test) {
  var polygon = d3.geoCircle().radius(60)();
  test.equal(d3.geoContains(polygon, [1, 1]), true);
  test.equal(d3.geoContains(polygon, [-180, 0]), false);
  test.end();
});

tape("a Polygon with a hole doesn't contain a point", function(test) {
  var outer = d3.geoCircle().radius(60)().coordinates[0],
      inner = d3.geoCircle().radius(3)().coordinates[0],
      polygon = {type:"Polygon", coordinates: [outer, inner]};
  test.equal(d3.geoContains(polygon, [1, 1]), false);
  test.equal(d3.geoContains(polygon, [5, 0]), true);
  test.equal(d3.geoContains(polygon, [65, 0]), false);
  test.end();
});

tape("a MultiPolygon contains a point", function(test) {
  var p1 = d3.geoCircle().radius(6)().coordinates,
      p2 = d3.geoCircle().radius(6).center([90,0])().coordinates,
      polygon = {type:"MultiPolygon", coordinates: [p1, p2]};
  test.equal(d3.geoContains(polygon, [1, 0]), true);
  test.equal(d3.geoContains(polygon, [90, 1]), true);
  test.equal(d3.geoContains(polygon, [90, 45]), false);
  test.end();
});

tape("a GeometryCollection contains a point", function(test) {
  var collection = {
    type: "GeometryCollection", geometries: [
      {type: "GeometryCollection", geometries: [{type: "LineString", coordinates: [[-45, 0], [0, 0]]}]},
      {type: "LineString", coordinates: [[0, 0], [45, 0]]}
    ]
  };
  test.equal(d3.geoContains(collection, [-45, 0]), true);
  test.equal(d3.geoContains(collection, [45, 0]), true);
  test.equal(d3.geoContains(collection, [12, 25]), false);
  test.end();
});

tape("a Feature contains a point", function(test) {
  var feature = {
    type: "Feature", geometry: {
      type: "LineString", coordinates: [[0, 0], [45, 0]]
    }
  };
  test.equal(d3.geoContains(feature, [45, 0]), true);
  test.equal(d3.geoContains(feature, [12, 25]), false);
  test.end();
});

tape("a FeatureCollection contains a point", function(test) {
  var feature1 = {
    type: "Feature", geometry: {
      type: "LineString", coordinates: [[0, 0], [45, 0]]
    }
  },
  feature2 = {
    type: "Feature", geometry: {
      type: "LineString", coordinates: [[-45, 0], [0, 0]]
    }
  },
  featureCollection = {
    type: "FeatureCollection",
    features: [ feature1, feature2 ]
  };
  test.equal(d3.geoContains(featureCollection, [45, 0]), true);
  test.equal(d3.geoContains(featureCollection, [-45, 0]), true);
  test.equal(d3.geoContains(featureCollection, [12, 25]), false);
  test.end();
});

tape("null contains nothing", function(test) {
  test.equal(d3.geoContains(null, [0, 0]), false);
  test.end();
});
