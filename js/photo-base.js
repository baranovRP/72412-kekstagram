/**
 * @author Roman Baranov
 */

'use strict';
(function() {
  /** @constructor */
  var PhotoBase = function() {
  };

  /** @type{?Object} */
  PhotoBase.prototype._data = null;

  PhotoBase.prototype.render = function() {};

  PhotoBase.prototype.remove = function() {};

  /** @param {Object} data */
  PhotoBase.prototype.setData = function(data) {
    this._data = data;
  };

  /** @return {Object} */
  PhotoBase.prototype.getData = function() {
    return this._data;
  };

  window.PhotoBase = PhotoBase;
})();
