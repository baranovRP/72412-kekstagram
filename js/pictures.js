/**
 * @initializer of the photos' list.
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
   * Image size
   * @const
   * @type {Object}
   */
  var IMG_SIZE = {
    width: 182,
    height: 182
  };

  /**
   * Hide elements on page, by adding 'hidden' class.
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
   * Show elements on page, by removing 'hidden' class.
   * @param {Array} arrEls
   */
  function showEls(arrEls) {
    arrEls.forEach(function(item) {
      item.classList.remove('hidden');
    });
  }

  /**
   * Create new page elements based on data from json.
   * @param {Array.<Objects>} arrObjs
   */
  function createElsFromJson(arrObjs) {
    arrObjs.forEach(function(picture) {
      var el = getElFromTemplate(picture);
      container.appendChild(el);
    });
  }

  function getPictures() {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', 'data/pictures.json');
    xhr.onload = function(evt) {
      var rawData = evt.target.response;
      var loadedPictures = JSON.parse(rawData);

      createElsFromJson(loadedPictures);
    };

    xhr.send();
  }

  /**
   * Create DOM-elements based on template.
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

    var img = new Image();
    img.src = data.url;
    img.width = IMG_SIZE.width;
    img.height = IMG_SIZE.height;

    /**
     * Event handler, to replace template's element by uploaded image.
     */
    img.onload = function() {
      el.replaceChild(img, el.querySelector('img'));
    };

    /**
     * Event handler, to add failure class in a case of error.
     */
    img.onerror = function() {
      el.classList.add('picture-load-failure');
    };

    return el;
  }

  hideEls(filtersNodes);
  getPictures();
  showEls(filtersNodes);
})();
