'use strict';

/**
 * @initializer of the photos' list.
 * @author Roman Baranov
 */

(function() {

  /** @type {Gallery} */
  var Gallery = require('./gallery');

  /** @type {Photo} */
  var Photo = require('./photo');

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
  var rawPictures = [];

  /** @type {Array} */
  var renderedEls = [];

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

  /** @type {Gallery} */
  var gallery = new Gallery();

  /**
   * Variable for saving current active filter.
   * @type {String}
   */
  var activeFilter = localStorage.getItem('activeFilter') || SortFilter.POPULAR_F;

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
   * @method
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
   * @method
   */
  function showEls(arrEls) {
    arrEls.forEach(function(item) {
      item.classList.remove('hidden');
    });
  }

  /**
   * Create new page elements based on data from json.
   * @param {Array.<Object>} arrObjs
   * @param {number} pageNumber
   * @param {boolean=} replace
   * @method
   */
  function renderEls(arrObjs, pageNumber, replace) {
    hideEls(filtersNodes);
    if (replace) {
      var el;
      while ((el = renderedEls.shift())) {
        container.removeChild(el.el);
        el.onClick = null;
        el.remove();
      }
    }

    gallery.setPictures(arrObjs);

    var firstPicture = pageNumber * PAGE_SIZE;
    var lastPicture = firstPicture + PAGE_SIZE;
    var picturesOnPage = arrObjs.slice(firstPicture, lastPicture);
    var domFragment = document.createDocumentFragment();

    picturesOnPage.map(function(picture, index) {
      var photoEl = new Photo(picture);
      photoEl.render();
      domFragment.appendChild(photoEl.el);

      photoEl.onClick = function() {
        var currentPosition = index + firstPicture;
        gallery.setCurrentPicture(currentPosition);
        gallery.setHashPhoto(photoEl._data.url);
      };

      renderedEls.push(photoEl);
    });

    container.appendChild(domFragment);
    showEls(filtersNodes);
  }

  /**
   * Check that that pictures filled the whole page.
   * @param {Array.<Object>} arrObjs
   * @method
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
  window.addEventListener('scroll', function(evt) {
    evt.preventDefault();

    var delayMsec = 100;
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(renderElsIfRequired(filteredPictures), delayMsec);
  });

  /**
   * Retrieve pictures data from json.
   * @method
   */
  function getPictures() {
    var xhr = new XMLHttpRequest();

    xhr.timeout = LOAD_TIMEOUT;
    xhr.open('GET', '//o0.github.io/assets/json/pictures.json');

    container.classList.add('pictures-loading');

    xhr.onload = function(evt) {
      evt.preventDefault();

      var rawData = evt.target.response;
      rawPictures = JSON.parse(rawData);
      filteredPictures = rawPictures.slice(0);

      updatePictures(rawPictures);
      gallery.togglePhoto();

      container.classList.remove('pictures-loading');
    };

    /**
     * Event handler, remove loading mask and add failure mask in a case of error.
     */
    var handleError = function(evt) {
      evt.preventDefault();

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
   * Add click event handlers for each sort filter.
   * @param {HTMLElement} el
   */
  filters.addEventListener('click', function(evt) {
    evt.preventDefault();

    var clickeEl = evt.target;
    if (clickeEl.classList.contains('filters-item')) {
      setActiveFilter(clickeEl.previousElementSibling.id);
    }
  });

  /**
   * Set chosen filter ans sort pictures according to filter.
   * @param {String} id
   * @param {boolean=} force
   * @method
   */
  function setActiveFilter(id, force) {
    if (activeFilter === id && !force) {
      return;
    }

    activeFilter = id;
    document.getElementById(activeFilter).checked = false;
    document.getElementById(id).checked = true;

    filteredPictures = rawPictures.slice(0);

    switch (id) {
      case SortFilter.POPULAR_F:
        filteredPictures = rawPictures;
        break;

      case SortFilter.NEW_F:
        var sortedByDate = filteredPictures.sort(function(a, b) {
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        });

        /**
         * Convert days into millisecs.
         * @param {number} days
         * @method
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

    localStorage.setItem('activeFilter', id);
  }

  /**
   * Assign filtered pictures by default and force filtering according to set active filter
   * @param {Array<Object>} rawPics
   * @method
   */
  function updatePictures(rawPics) {
    filteredPictures = rawPics;
    setActiveFilter(activeFilter, true);
  }

  getPictures();
})();
