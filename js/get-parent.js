'use strict';

/**
 * Get parent frame
 */
(function getParent() {
  if (window) {
    return window;
  } else {
    return parent.window;
  }
})();
