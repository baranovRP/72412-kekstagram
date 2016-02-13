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
  }

  /**
   * Show gallery
   */
  Gallery.prototype.show = function() {
    this.el.classList.remove('invisible');

    /**
     * Event handler, close gallery by clicking on close button.
     */
    this._closeButton.addEventListener('click', function(evt) {
      evt.preventDefault();
      this.hide();
    }.bind(this));

    /**
     * Event handler, close gallery by clicking on overlay area.
     */
    this.el.addEventListener('click', function(evt) {
      if (evt.target.classList.contains('gallery-overlay')) {
        evt.preventDefault();
        this.hide();
      }
    }.bind(this));

    /**
     * Event handler, close gallery by pressing on 'Esc' button.
     */
    document.addEventListener('keydown', function(evt) {
      if (evt.keyCode === VK_ESCAPE) {
        evt.preventDefault();
        this.hide();
      }
    }.bind(this));
  };

  /**
   * Hide gallery
   */
  Gallery.prototype.hide = function() {
    this.el.classList.add('invisible');
  };

  window.Gallery = Gallery;
})();
