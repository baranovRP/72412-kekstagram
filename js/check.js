'use strict';

function getMessage(a, b) {
  var calcTotalCompression = function (a, b) {
    var sum = 0;
    if (a.length != b.length) {
      throw 'Arrays have different sizes';
    }

    for (var i = 0; i < a.length; i++) {
      sum += a[i] * b[i];
    }
    return sum;
  };

  var sumRedDots = function (a) {
    var sum = 0;
    for (var i = 0; i < a.length; i++) {
      sum += a[i];
    }
    return sum;
  };

  var isDigit = function (x) {
    return typeof x === 'number';
  };

  var checkGif = function () {
    if (a) {
      if (isDigit(b)) {
        return 'Переданное GIF-изображение анимировано и содержит ' + b + ' кадров';
      }
      else {
        throw 'Second argument:' + b + 'is not a number';
      }
    } else {
      return 'Переданное GIF-изображение не анимировано';
    }
  };

  var checkSvg = function () {
    if (isDigit(b)) {
      var calcAttr = b * 4;
      return 'Переданное SVG-изображение содержит ' + a + ' объектов и ' + calcAttr + ' аттрибутов';
    }
    throw 'Second argument:' + b + 'is not a number';
  };


  if (Array.isArray(a)) {
    if (Array.isArray(b)) {
      return 'Общая площадь артефактов сжатия: ' + calcTotalCompression(a, b) + ' пикселей';
    } else {
      return 'Количество красных точек во всех строчках изображения: ' + sumRedDots(a);
    }
  }

  switch (typeof a) {
    case 'boolean':
      checkGif();
      break;
    case 'number':
      checkSvg();
      break;
    default:
      throw 'First argument:' + a + 'has not supported type';
  }
}
