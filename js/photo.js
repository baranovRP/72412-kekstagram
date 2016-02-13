/**
 * @author Roman Baranov
 */

'use strict';

(function() {
  /**
   * @param {Object} data
   * @constructor
   */
  function Photo(data) {
    this._data = data;
  }

  var IMG_SIZE = {
    width: 182,
    height: 182
  };

  var LOAD_TIMEOUT_MS = 10000;

  Photo.prototype.render = function() {
    var template = document.querySelector('#picture-template');

    if ('content' in template) {
      this.el = template.content.childNodes[1].cloneNode(true);
    } else {
      this.el = template.childNodes[1].cloneNode(true);
    }

    this.el.querySelector('.picture-likes').textContent = this._data.likes;
    this.el.querySelector('.picture-comments').textContent = this._data.comments;

    var img = new Image();
    img.src = this._data.url;
    img.width = IMG_SIZE.width;
    img.height = IMG_SIZE.height;

    /**
     * Event handler, to replace template's element by uploaded image.
     */
    img.addEventListener('load', function() {
      clearTimeout(pictureLoadTimeout);
      this.el.replaceChild(img, this.el.querySelector('img'));
    }.bind(this));

    /**
     * Event handler, to add failure class in a case of error.
     */
    img.addEventListener('error', function() {
      this.el.classList.add('picture-load-failure');
    }.bind(this));

    /**
     * Create timeout.
     * @type {Object}
     */
    var pictureLoadTimeout = setTimeout(function() {
      img.src = '';
      this.el.classList.add('picture-load-failure');
    }.bind(this), LOAD_TIMEOUT_MS);
  };

  window.Photo = Photo;
})();
