/**
 * @author Roman Baranov
 */

'use strict';

(function() {
  /**
   * Inherit parent's properties
   * @param {Function} child
   * @param {Function} parent
   */
  function inherit(child, parent) {
    /**
     * @constructor
     */
    var EmptyConstructor = function() {
    };

    if (!child || !parent) {
      throw 'Absent parameters';
    }

    EmptyConstructor.prototype = parent.prototype;
    child.prototype = new EmptyConstructor();
    child.prototype.constructor = child;
  }

  window.inherit = inherit;
})();
