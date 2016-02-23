/* global inherit: true, PhotoBase: true */

/**
 * @author Roman Baranov
 */

'use strict';

(function() {

  var template = document.querySelector('#picture-template');

  var IMG_SIZE = {
    width: 182,
    height: 182
  };

  var LOAD_TIMEOUT_MS = 10000;

  Photo.prototype._data = null;
  /**
   * @param {Object} data
   * @constructor
   * @extends {PhotoBase}
   */
  function Photo() {
    this._onClick = this._onClick.bind(this);
    PhotoBase.call(this);
  }

  inherit(Photo, PhotoBase);
  /**
   * Create DOM-elements based on template.
   * @override
   */
  Photo.prototype.render = function() {
    if ('content' in template) {
      this.el = template.content.childNodes[1].cloneNode(true);
    } else {
      this.el = template.childNodes[1].cloneNode(true);
    }

    this.el.querySelector('.picture-likes').textContent = this.getData().likes;
    this.el.querySelector('.picture-comments').textContent = this.getData().comments;

    var img = new Image();
    img.src = this.getData().url;
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

    this.el.addEventListener('click', this._onClick);
  };

  Photo.prototype.remove = function() {
    this.el.removeEventListener('click', this._onClick);
  };

  /**
   * Event handler, click on picture
   * @param {Event} evt
   * @private
   */
  Photo.prototype._onClick = function(evt) {
    evt.preventDefault();

    if (evt.target.parentNode.classList.contains('picture')
      && !evt.target.parentNode.classList.contains('picture-load-failure')) {
      if (typeof this.onClick === 'function') {
        this.onClick();
      }
    }
  };

  /**
   * @type {?Function}
   */
  Photo.prototype.onClick = null;

  window.Photo = Photo;
})();
