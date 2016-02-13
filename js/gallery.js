/**
 * @author Roman Baranov
 */

'use strict';

(function() {

  var VK_ESCAPE = 27;

  /**
   * @constructor
   */
  function Gallery() {
    this.el = document.querySelector('.gallery-overlay');
    this._closeButton = document.querySelector('.gallery-overlay-close');

    this._onEscPress = this._onEscPress.bind(this);
    this._onOverlayClick = this._onOverlayClick.bind(this);
    this._onCloseClick = this._onCloseClick.bind(this);
  }

  /**
   * Show gallery
   */
  Gallery.prototype.show = function() {
    this.el.classList.remove('invisible');

    window.addEventListener('keydown', this._onEscPress);
    this.el.addEventListener('click', this._onOverlayClick);
    this._closeButton.addEventListener('click', this._onCloseClick);
  };

  /**
   * Hide gallery
   */
  Gallery.prototype.hide = function() {
    this.el.classList.add('invisible');

    window.removeEventListener('keydown', this._onEscPress);
    this.el.removeEventListener('click', this._onOverlayClick);
    this._closeButton.removeEventListener('click', this._onCloseClick);

  };

  /**
   * Event handler, close gallery by pressing on 'Esc' button.
   */
  Gallery.prototype._onEscPress = function(evt) {
    if (evt.keyCode === VK_ESCAPE) {
      evt.preventDefault();
      this.hide();
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

  window.Gallery = Gallery;
})();
