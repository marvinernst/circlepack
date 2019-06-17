const _canvasProps = { width: 687, height: 579 };
const _options = {
  spacing: 3,
  numCircles: 1000,
  minSize: parseInt(window.location.search.split('=')[1]),
  maxSize: parseInt(window.location.search.split('=')[1]),
  higherAccuracy: true,
};
console.log(_options);
let _placedCirclesArr = [];

const _isFilled = function(imgData, imageWidth, x, y) {
  x = Math.round(x);
  y = Math.round(y);
  const a = imgData.data[(imageWidth * y + x) * 4 + 3];
  return a > 0;
};

const _isCircleInside = function(imgData, imageWidth, x, y, r) {
  // if (!_isFilled(imgData, imageWidth, x, y)) return false;
  // --use 4 points around circle as good enough approximation
  if (!_isFilled(imgData, imageWidth, x, y - r)) return false;
  if (!_isFilled(imgData, imageWidth, x, y + r)) return false;
  if (!_isFilled(imgData, imageWidth, x + r, y)) return false;
  if (!_isFilled(imgData, imageWidth, x - r, y)) return false;
  if (_options.higherAccuracy) {
    // --use another 4 points between the others as better approximation
    const o = Math.cos(Math.PI / 4);
    if (!_isFilled(imgData, imageWidth, x + o, y + o)) return false;
    if (!_isFilled(imgData, imageWidth, x - o, y + o)) return false;
    if (!_isFilled(imgData, imageWidth, x - o, y - o)) return false;
    if (!_isFilled(imgData, imageWidth, x + o, y - o)) return false;
  }
  return true;
};

const _touchesPlacedCircle = function(x, y, r) {
  return _placedCirclesArr.some(
    circle => _dist(x, y, circle.x, circle.y) < circle.size + r + _options.spacing // return true immediately if any match
  );
};

var _dist = function(x1, y1, x2, y2) {
  const a = x1 - x2;
  const b = y1 - y2;
  return Math.sqrt(a * a + b * b);
};

const _placeCircles = function(imgData) {
  let i = _circles.length;
  _placedCirclesArr = [];
  while (i > 0) {
    i--;
    const circle = _circles[i];
    let safety = 1000;
    while (!circle.x && safety-- > 0) {
      const x = Math.random() * _canvasProps.width;
      const y = Math.random() * _canvasProps.height;
      if (_isCircleInside(imgData, _canvasProps.width, x, y, circle.size)) {
        if (!_touchesPlacedCircle(x, y, circle.size)) {
          circle.x = x;
          circle.y = y;
          _placedCirclesArr.push(circle);
        }
      }
    }
  }
};

const _makeCircles = function() {
  const circles = [];
  for (let i = 0; i < _options.numCircles; i++) {
    const circle = {
      color: _colors[Math.round(Math.random() * _colors.length)],
      size: Math.random() * 100 > 90 ? _options.maxSize : _options.minSize, // do random twice to prefer more smaller ones
    };
    circles.push(circle);
  }
  circles.sort((a, b) => a.size - b.size);
  return circles;
};

const _drawCircles = function(ctx) {
  ctx.save();
  $.each(_circles, (i, circle) => {
    ctx.fillStyle = circle.color;
    ctx.beginPath();
    ctx.arc(circle.x, circle.y, circle.size, 0, 2 * Math.PI);
    ctx.closePath();
    ctx.fill();
  });

  ctx.restore();
};

const _drawSvg = function(ctx, path, callback) {
  const img = new Image(ctx);
  img.onload = function() {
    ctx.drawImage(img, 0, 0);
    callback();
  };
  img.src = path;
};

var _colors = ['#993300', '#a5c916', '#00AA66', '#FF9900'];
var _circles = _makeCircles();

$(document).ready(() => {
  const $canvas = $('<canvas>')
    .attr(_canvasProps)
    .appendTo('body');
  const $canvas2 = $('<canvas>')
    .attr(_canvasProps)
    .appendTo('body');
  const ctx = $canvas[0].getContext('2d');
  _drawSvg(ctx, 'ellipse.svg', () => {
    const imgData = ctx.getImageData(0, 0, _canvasProps.width, _canvasProps.height);
    _placeCircles(imgData);
    _drawCircles($canvas2[0].getContext('2d'));
  });
});
