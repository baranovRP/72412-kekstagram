/**
 * @initializer of the photos' list.
 * @author Roman Baranov
 */

'use strict';

(function() {
  /**
   * Types of sort filters.
   * @enum {String}
   */
  var SortFilter = {
    POPULAR_F: 'filter-popular',
    NEW_F: 'filter-new',
    DISCUSSED_F: 'filter-discussed'
  };

  /**
   * Array, that contains nodes with class 'filters'.
   * @type {Array}
   */
  var filtersNodes = Array.prototype.slice.call(document.querySelectorAll('.filters'));

  /**
   * HTMElement, that contains node with class 'filters'.
   * @type {HTMLElement}
   */
  var filters = document.querySelector('.filters');

  /**
   * Array, for saving initial order of pictures.
   * @type {Array}
   */
  var pictures = [];

  /**
   * Array, for saving filtered/sorted order of pictures.
   * @type {Array}
   */
  var filteredPictures = [];

  /**
   * Container for pictures.
   * @type {HtmlElement}
   */
  var container = document.querySelector('.pictures');

  /**
   * Variable for saving current active filter.
   * @type {String}
   */
  var activeFilter = SortFilter.POPULAR_F;

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
   * Load timeout
   * @const
   * @type {number}
   */
  var LOAD_TIMEOUT = 10000;

  var scrollTimeout;

  /**
   * Days age
   * @const
   * @type {number}
   */
  var DAYS_AGO = 14;

  /**
   * Pictures on page
   * @const
   * @type {number}
   */
  var PAGE_SIZE = 12;

  var currentPage = 0;

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
   * @param {number} pageNumber
   * @param {boolean} replace
   */
  function renderEls(arrObjs, pageNumber, replace) {
    hideEls(filtersNodes);
    if (replace) {
      container.innerHTML = '';
    }

    var firstPicture = pageNumber * PAGE_SIZE;
    var lastPicture = firstPicture + PAGE_SIZE;
    var picturesOnPage = arrObjs.slice(firstPicture, lastPicture);

    var domFragment = document.createDocumentFragment();
    picturesOnPage.forEach(function(picture) {
      var el = getElFromTemplate(picture);
      domFragment.appendChild(el);
    });

    container.appendChild(domFragment);
    showEls(filtersNodes);
  }

  /**
   * Check that that pictures filled the whole page.
   * @param {Array.<Objects>} arrObjs
   */
  function renderElsIfRequired(arrObjs) {
    var containerHeight = container.getBoundingClientRect().bottom;

    if (containerHeight <= window.innerHeight) {
      if (currentPage < Math.ceil(arrObjs.length / PAGE_SIZE)) {
        renderEls(arrObjs, ++currentPage);
      }
    }
  }

  /**
   * Event handler, set delay for scrolling.
   */
  window.addEventListener('scroll', function() {
    var delayMsec = 100;
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(renderElsIfRequired(filteredPictures), delayMsec);
  });

  /**
   * Retrieve pictures data from json.
   */
  function getPictures() {
    var xhr = new XMLHttpRequest();

    xhr.timeout = LOAD_TIMEOUT;
    xhr.open('GET', 'data/pictures.json');

    container.classList.add('pictures-loading');

    xhr.onload = function(evt) {
      var rawData = evt.target.response;
      pictures = JSON.parse(rawData);
      filteredPictures = pictures.slice(0);

      renderEls(pictures, currentPage);
      renderElsIfRequired(filteredPictures);
      container.classList.remove('pictures-loading');
    };

    /**
     * Event handler, remove loading mask and add failure mask in a case of error.
     */
    var handleError = function() {
      if (container.classList.contains('pictures-loading')) {
        container.classList.remove('pictures-loading');
      }
      container.classList.add('pictures-failure');
    };

    xhr.onerror = handleError;
    xhr.ontimeout = handleError;

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
      clearTimeout(pictureLoadTimeout);
      el.replaceChild(img, el.querySelector('img'));
    };

    /**
     * Event handler, to add failure class in a case of error.
     */
    img.onerror = function() {
      el.classList.add('picture-load-failure');
    };

    /**
     * Create timeout.
     * @type {Object}
     */
    var pictureLoadTimeout = setTimeout(function() {
      img.src = '';
      el.classList.add('picture-load-failure');
    }, LOAD_TIMEOUT);

    return el;
  }

  /**
   * Add click event handlers for each sort filter.
   * @param {HTMLElement} el
   */
  filters.addEventListener('click', function(evt) {
    var clickeEl = evt.target;
    if (clickeEl.classList.contains('filters-item')) {
      setActiveFilter(clickeEl.previousElementSibling.id);
    }
  });

  /**
   * Set chosen filter ans sort pictures according to filter.
   * @param {String} id
   */
  function setActiveFilter(id) {
    if (activeFilter === id) {
      return;
    }

    activeFilter = id;
    document.getElementById(activeFilter).checked = false;
    document.getElementById(id).checked = true;

    filteredPictures = pictures.slice(0);

    switch (id) {
      case SortFilter.POPULAR_F:
        filteredPictures = pictures;
        break;

      case SortFilter.NEW_F:
        var sortedByDate = filteredPictures.sort(function(a, b) {
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        });

        /**
         * Convert days into millisecs.
         * @param {number} days
         */
        var convertDaysToMsec = function(days) {
          return days * 24 * 60 * 60 * 1000;
        };

        filteredPictures = sortedByDate.filter(function(el) {

          var daysAgoInMsec = function(days) {
            return +Date.now() - convertDaysToMsec(days);
          };

          return new Date(el.date).getTime() - daysAgoInMsec(DAYS_AGO) >= 0;
        });
        break;

      case SortFilter.DISCUSSED_F:
        filteredPictures = filteredPictures.sort(function(a, b) {
          return b.comments - a.comments;
        });
        break;

      default:
        throw new Error('Unexpected id name: ' + id);
    }

    currentPage = 0;
    renderEls(filteredPictures, currentPage, true);
    renderElsIfRequired(filteredPictures);
  }

  getPictures();
})();
