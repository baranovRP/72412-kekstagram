'use strict';

/** @author Roman Baranov */

(function() {
  /**
   * Types of key event codes.
   * @enum {number}
   */
  var KeyEvent = {
    VK_ESCAPE: 27,
    VK_KP_RIGHT: 39,
    VK_KP_LEFT: 37
  };

  /**
   * Types direction show pictures
   * @enum {number}
   */
  var Direction = {
    NEXT: 1,
    PREV: -1
  };

  /**
   * @constructor
   */
  function Gallery() {
    this._currentIdx = 0;

    this.el = document.querySelector('.gallery-overlay');
    this._closeButton = this.el.querySelector('.gallery-overlay-close');
    this._photo = this.el.querySelector('.gallery-overlay-image');
    this._photoLikes = this.el.querySelector('.gallery-overlay-controls-like .likes-count');
    this._photoComments = this.el.querySelector('.gallery-overlay-controls-comments .comments-count');

    this._onPhotoClick = this._onPhotoClick.bind(this);
    this._onDocumentKeyDown = this._onDocumentKeyDown.bind(this);
    this._onOverlayClick = this._onOverlayClick.bind(this);
    this._onCloseClick = this._onCloseClick.bind(this);
    this._onHashChange = this._onHashChange.bind(this);

    window.addEventListener('load', this._onHashChange);
    window.addEventListener('hashchange', this._onHashChange);
  }

  /** @module gallery */
  module.exports = Gallery;

  /**
   * Show gallery
   * @method
   */
  Gallery.prototype.show = function() {
    this.el.classList.remove('invisible');

    this._photo.addEventListener('click', this._onPhotoClick);

    this.setCurrentPicture(this._currentIdx);
    document.addEventListener('keydown', this._onDocumentKeyDown);
    this.el.addEventListener('click', this._onOverlayClick);
    this._closeButton.addEventListener('click', this._onCloseClick);
  };

  /**
   * Hide gallery
   * @method
   */
  Gallery.prototype.hide = function() {
    location.hash = '';
    this.el.classList.add('invisible');

    this._photo.removeEventListener('click', this._onPhotoClick);

    document.removeEventListener('keydown', this._onDocumentKeyDown);
    this.el.removeEventListener('click', this._onOverlayClick);
    this._closeButton.removeEventListener('click', this._onCloseClick);

  };

  /**
   * Save array of pictures
   * @method
   * @param {Array.<Object>} data
   */
  Gallery.prototype.setPictures = function(data) {
    this._data = data;
  };

  /**
   * Take and set picture from array by index
   * @method
   * @param {number|string} idx
   */
  Gallery.prototype.setCurrentPicture = function(idx) {
    var currentPhoto;

    if (typeof idx === 'number') {
      if (idx < 0 || idx > this._data.length - 1) {
        return;
      }
      this._currentIdx = idx;
      currentPhoto = this._data[this._currentIdx];
    } else if (typeof idx === 'string') {
      for (var i = 0; i < this._data.length; i++) {
        if (this._data[i].url === idx) {
          currentPhoto = this._data[i];
          return;
        }
      }
    }

    if (!currentPhoto) {
      return;
    }
    this._photo.src = currentPhoto.url;
    this._photoLikes.textContent = currentPhoto.likes;
    this._photoComments.textContent = currentPhoto.comments;
  };

  /**
   * Event handler, close gallery by pressing on 'Esc' button.
   * @private
   */
  Gallery.prototype._onDocumentKeyDown = function(evt) {
    evt.preventDefault();

    switch (evt.keyCode) {
      case KeyEvent.VK_ESCAPE:
        this.hide();
        break;
      case KeyEvent.VK_KP_RIGHT:
        this._showPicture(Direction.NEXT);
        break;
      case KeyEvent.VK_KP_LEFT:
        this._showPicture(Direction.PREV);
        break;
      default:
        break;
    }
  };

  /**
   * Event handler, close gallery by clicking on overlay area.
   * @private
   */
  Gallery.prototype._onOverlayClick = function(evt) {
    if (evt.target.classList.contains('gallery-overlay')) {
      evt.preventDefault();
      this.hide();
    }
  };

  /**
   * Event handler, close gallery by clicking on close button.
   * @private
   */
  Gallery.prototype._onCloseClick = function(evt) {
    evt.preventDefault();
    this.hide();
  };

  /**
   * Show picture, next/prev depends on direction
   * @param{number} direction
   * @private
   */
  Gallery.prototype._showPicture = function(direction) {
    var index = this._currentIdx + direction;
    if (this._data[index]) {
      this.setHashPhoto(this._data[index].url);
    }
  };

  /**
   * Event handler, click on photo.
   * @private
   */
  Gallery.prototype._onPhotoClick = function(evt) {
    evt.preventDefault();
    this._showPicture(Direction.NEXT);
  };

  /**
   * Event handler, listen changes in hash.
   * @private
   */
  Gallery.prototype._onHashChange = function(evt) {
    evt.preventDefault();
    this.togglePhoto();
  };

  Gallery.prototype.togglePhoto = function() {
    var matchedHash = window.location.hash.match(/#photo\/(\S+)/);
    if (Array.isArray(matchedHash)) {
      this.setCurrentPicture(matchedHash[1]);
      this.show();
    } else {
      this.hide();
    }
  };


  /**
   * Set hash.
   * @param{string} pathToPhoto
   */
  Gallery.prototype.setHashPhoto = function(pathToPhoto) {
    if (pathToPhoto) {
      window.location.hash = '#photo' + '/' + pathToPhoto;
    }
  };
})();
