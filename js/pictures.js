/* global pictures: true */

/**
 * @initializer of the photos' list
 * @author Roman Baranov
 */

'use strict';

(function() {

  /**
   * Array, that contains nodes with class 'filters'.
   * @type {Array}
   */
  var filtersNodes = Array.prototype.slice.call(document.querySelectorAll('.filters'));

  /**
   * Container for pictures.
   * @type {HtmlElement}
   */
  var container = document.querySelector('.pictures');

  /**
   * Hide elements on page, by adding 'hidden' class
   * @param {Array} arrEls
   */
  function hideEls(arrEls) {
    arrEls.forEach(function(item) {
      var cssCls = 'hidden';

      if (!item.classList.contains(cssCls)) {
        item.classList.add(cssCls);
      }
    });
  }

  /**
   * Show elements on page, by removing 'hidden' class
   * @param {Array} arrEls
   */
  function showEls(arrEls) {
    arrEls.forEach(function(item) {
      item.classList.remove('hidden');
    });
  }

  /**
   * Create new page elements based on data from jsonp
   * @param {Array} arrObjs
   */
  function createElsFromJsonp(arrObjs) {
    arrObjs.forEach(function(picture) {
      var el = getElFromTemplate(picture);
      container.appendChild(el);
    });
  }

  /**
   * Create DOM-elements based on template
   * @param {Object} data
   * @return {Element}
   */
  function getElFromTemplate(data) {
    var template = document.querySelector('#picture-template');
    var el;

    if ('content' in template) {
      el = template.content.children[0].cloneNode(true);
    } else {
      el = template.children[0].cloneNode(true);
    }

    el.querySelector('.picture-likes').textContent = data.likes;
    el.querySelector('.picture-comments').textContent = data.comments;
    return el;
  }

  hideEls(filtersNodes);
  createElsFromJsonp(pictures);
  showEls(filtersNodes);
})();
