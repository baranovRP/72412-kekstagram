/* global pictures: true */

/**
 * @initializer of the photos' list
 * @author Roman Baranov
 */

'use strict';

(function() {

  (function() {
    var filtersNodes = Array.prototype.slice.call(document.querySelectorAll('.filters'));

    filtersNodes.forEach(function(item) {
      item.classList.remove('hidden');
    });
  }());



})();
