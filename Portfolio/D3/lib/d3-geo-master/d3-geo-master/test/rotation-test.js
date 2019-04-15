var tape = require("tape"),
    d3 = require("../");

require("./inDelta");

tape("a rotation of [+90°, 0°] only rotates longitude", function(test) {
  var rotation = d3.geoRotation([90, 0])([0, 0]);
  test.inDelta(rotation[0], 90, 1e-6);
  test.inDelta(rotation[1], 0, 1e-6);
  test.end();
});

tape("a rotation of [+90°, 0°] wraps around when crossing the antimeridian", function(test) {
  var rotation = d3.geoRotation([90, 0])([150, 0]);
  test.inDelta(rotation[0], -120, 1e-6);
  test.inDelta(rotation[1], 0, 1e-6);
  test.end();
});

tape("a rotation of [-45°, -45°] rotates longitude and latitude", function(test) {
  var rotation = d3.geoRotation([-45, 45])([0, 0]);
  test.inDelta(rotation[0], -54.73561, 1e-6);
  test.inDelta(rotation[1], 30, 1e-6);
  test.end();
});

tape("a rotation of [-45°, -45°] inverse rotation of longitude and latitude", function(test) {
  var rotation = d3.geoRotation([-45, 45]).invert([-54.73561, 30]);
  test.inDelta(rotation[0], 0, 1e-6);
  test.inDelta(rotation[1], 0, 1e-6);
  test.end();
});
