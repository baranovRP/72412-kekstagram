'use strict';

(function() {
  /**
   * @constructor
   * @param {string} image
   */
  var Resizer = function(image) {
    // Изображение, с которым будет вестись работа.
    this._image = new Image();
    this._image.src = image;

    // Холст.
    this._container = document.createElement('canvas');
    this._ctx = this._container.getContext('2d');

    // Создаем холст только после загрузки изображения.
    this._image.onload = function() {
      // Размер холста равен размеру загруженного изображения. Это нужно
      // для удобства работы с координатами.
      this._container.width = this._image.naturalWidth;
      this._container.height = this._image.naturalHeight;

      /**
       * Предлагаемый размер кадра в виде коэффициента относительно меньшей
       * стороны изображения.
       * @const
       * @type {number}
       */
      var INITIAL_SIDE_RATIO = 0.75;
      // Размер меньшей стороны изображения.
      var side = Math.min(
          this._container.width * INITIAL_SIDE_RATIO,
          this._container.height * INITIAL_SIDE_RATIO);

      // Изначально предлагаемое кадрирование — часть по центру с размером в 3/4
      // от размера меньшей стороны.
      this._resizeConstraint = new Square(
          this._container.width / 2 - side / 2,
          this._container.height / 2 - side / 2,
          side);

      // Отрисовка изначального состояния канваса.
      this.redraw();
    }.bind(this);

    // Фиксирование контекста обработчиков.
    this._onDragStart = this._onDragStart.bind(this);
    this._onDragEnd = this._onDragEnd.bind(this);
    this._onDrag = this._onDrag.bind(this);
  };

  Resizer.prototype = {
    /**
     * Родительский элемент канваса.
     * @type {Element}
     * @private
     */
    _element: null,

    /**
     * Положение курсора в момент перетаскивания. От положения курсора
     * рассчитывается смещение на которое нужно переместить изображение
     * за каждую итерацию перетаскивания.
     * @type {Coordinate}
     * @private
     */
    _cursorPosition: null,

    /**
     * Объект, хранящий итоговое кадрирование: сторона квадрата и смещение
     * от верхнего левого угла исходного изображения.
     * @type {Square}
     * @private
     */
    _resizeConstraint: null,

    /**
     * Отрисовка канваса.
     */
    redraw: function() {
      // Очистка изображения.
      this._ctx.clearRect(0, 0, this._container.width, this._container.height);

      // Параметры линии.
      // NB! Такие параметры сохраняются на время всего процесса отрисовки
      // canvas'a поэтому важно вовремя поменять их, если нужно начать отрисовку
      // чего-либо с другой обводкой.

      // Толщина линии.
      this._ctx.lineWidth = 6;
      // Цвет обводки.
      this._ctx.strokeStyle = '#ffe753';
      // Размер штрихов. Первый элемент массива задает длину штриха, второй
      // расстояние между соседними штрихами.
      this._ctx.setLineDash([15, 10]);
      // Смещение первого штриха от начала линии.
      this._ctx.lineDashOffset = 7;

      // Сохранение состояния канваса.
      // Подробней см. строку 132.
      this._ctx.save();

      // Установка начальной точки системы координат в центр холста.
      this._ctx.translate(this._container.width / 2, this._container.height / 2);

      var displX = -(this._resizeConstraint.x + this._resizeConstraint.side / 2);
      var displY = -(this._resizeConstraint.y + this._resizeConstraint.side / 2);
      // Отрисовка изображения на холсте. Параметры задают изображение, которое
      // нужно отрисовать и координаты его верхнего левого угла.
      // Координаты задаются от центра холста.
      this._ctx.drawImage(this._image, displX, displY);

      var frameRect = {
        frameX: (-this._resizeConstraint.side / 2) - this._ctx.lineWidth / 2,
        frameY: (-this._resizeConstraint.side / 2) - this._ctx.lineWidth / 2,
        frameW: this._resizeConstraint.side - this._ctx.lineWidth / 2,
        frameH: this._resizeConstraint.side - this._ctx.lineWidth / 2
      };

      this._showCropArea(frameRect, this._ctx.lineWidth);

      // Отрисовка прямоугольника, обозначающего область изображения после
      // кадрирования. Координаты задаются от центра.
      // comment for revoke methods with different frame style
      this._ctx.strokeRect(frameRect.frameX, frameRect.frameY, frameRect.frameW, frameRect.frameH);

      // comment line 126 and uncomment next lines for dotted frame
      //var shiftInterval = 2;
      //this._drawDottedBorder(frameRect, this._ctx.lineWidth, this._ctx.strokeStyle, shiftInterval);

      var figureSize = this._image.naturalWidth + ' x ' + this._image.naturalHeight;
      var axisX = 0;
      var axisY = (-this._resizeConstraint.side / 2) - (this._ctx.lineWidth + this._ctx.lineWidth / 2);
      this._displayText(figureSize, axisX, axisY);

      // Восстановление состояния канваса, которое было до вызова ctx.save
      // и последующего изменения системы координат. Нужно для того, чтобы
      // следующий кадр рисовался с привычной системой координат, где точка
      // 0 0 находится в левом верхнем углу холста, в противном случае
      // некорректно сработает даже очистка холста или нужно будет использовать
      // сложные рассчеты для координат прямоугольника, который нужно очистить.
      this._ctx.restore();
    },

    /**
     * Draw dotted rectangular.
     * @param {Object} rectangular
     * @param {number} lineWidth
     * @param {string} fillStyle
     * @param {number} shift
     * @private
     */
    _drawDottedBorder: function(rectangular, lineWidth, fillStyle, shift) {
      this._ctx.save();

      /** @constant {number} */
      var CIRCLE_DIAMETER = lineWidth;

      var dashLength = (CIRCLE_DIAMETER + shift);

      this._ctx.fillStyle = fillStyle;

      var horizontalLength = rectangular.frameW;
      var verticalLength = rectangular.frameH;

      var topLeft = {
        topLeftX: rectangular.frameX,
        topLeftY: rectangular.frameY
      };
      var topRight = {
        topRightX: rectangular.frameX + rectangular.frameW,
        topRightY: rectangular.frameY
      };
      var bottomRight = {
        bottomRightX: rectangular.frameX + rectangular.frameW,
        bottomRightY: rectangular.frameY + rectangular.frameH
      };
      var bottomLeft = {
        bottomLeftX: rectangular.frameX,
        bottomLeftY: rectangular.frameY + rectangular.frameH
      };

      // top horizontal line
      this._ctx.moveTo(topLeft.topLeftX, topLeft.topLeftY);
      for (var i = 0; i < horizontalLength / dashLength; i++ ) {
        this._ctx.beginPath();
        this._ctx.arc(topLeft.topLeftX + i * dashLength, topLeft.topLeftY, CIRCLE_DIAMETER / 2, 0, Math.PI * 2, true);
        this._ctx.fill();

      }

      // right vertical line
      this._ctx.moveTo(topRight.topRightX, topRight.topRightY);
      for (var l = 0; l < verticalLength / dashLength; l++) {
        this._ctx.beginPath();
        this._ctx.arc(topRight.topRightX, topRight.topRightY + l * dashLength, CIRCLE_DIAMETER / 2, 0, Math.PI * 2, true);
        this._ctx.fill();
      }

      // bottom horizontal line
      this._ctx.moveTo(bottomRight.bottomRightX, bottomRight.bottomRightY);
      for (var k = 0; k < horizontalLength / dashLength; k++) {
        this._ctx.beginPath();
        this._ctx.arc(bottomRight.bottomRightX - k * dashLength, bottomRight.bottomRightY, CIRCLE_DIAMETER / 2, 0, Math.PI * 2, true);
        this._ctx.fill();
      }

      // left vertical line
      this._ctx.moveTo(bottomLeft.bottomLeftX, bottomLeft.bottomLeftY);
      for (var j = 0; j < verticalLength / dashLength; j++) {
        this._ctx.beginPath();
        this._ctx.arc(bottomLeft.bottomLeftX, bottomLeft.bottomLeftY - j * dashLength, CIRCLE_DIAMETER / 2, 0, Math.PI * 2, true);
        this._ctx.fill();
      }

      this._ctx.restore();
    },

    /**
     * Create and show picture's crop area by decrease opacity of cropped parts.
     * @param {Object} rectangular
     * @param {number} lineWidth
     * @private
     */
    _showCropArea: function(rectangular, lineWidth) {
      this._ctx.save();

      var maskCanvas = document.createElement('canvas');
      maskCanvas.width = this._container.width;
      maskCanvas.height = this._container.height;
      var _ctxMask = maskCanvas.getContext('2d');

      _ctxMask.fillStyle = 'rgba(0, 0, 0, 0.8)';
      _ctxMask.fillRect(0, 0, maskCanvas.width, maskCanvas.height);

      _ctxMask.globalCompositeOperation = 'xor';

      _ctxMask.translate(this._container.width / 2, this._container.height / 2);
      _ctxMask.fillRect(
        rectangular.frameX - lineWidth / 2,
        rectangular.frameY - lineWidth / 2,
        rectangular.frameW + lineWidth,
        rectangular.frameH + lineWidth);
      this._ctx.drawImage(maskCanvas, -this._container.width / 2, -this._container.height / 2);

      this._ctx.restore();
    },

    /**
     * Display text in specified coordinates.
     * @param {string} text
     * @param {number} axisX
     * @param {number} axisY
     * @private
     */
    _displayText: function(text, axisX, axisY) {
      this._ctx.fillStyle = '#ffffff';
      this._ctx.font = '10pt Arial';
      this._ctx.textAlign = 'center';

      this._ctx.fillText(text, axisX, axisY);
    },

    /**
     * Включение режима перемещения. Запоминается текущее положение курсора,
     * устанавливается флаг, разрешающий перемещение и добавляются обработчики,
     * позволяющие перерисовывать изображение по мере перетаскивания.
     * @param {number} x
     * @param {number} y
     * @private
     */
    _enterDragMode: function(x, y) {
      this._cursorPosition = new Coordinate(x, y);
      document.body.addEventListener('mousemove', this._onDrag);
      document.body.addEventListener('mouseup', this._onDragEnd);
    },

    /**
     * Выключение режима перемещения.
     * @private
     */
    _exitDragMode: function() {
      this._cursorPosition = null;
      document.body.removeEventListener('mousemove', this._onDrag);
      document.body.removeEventListener('mouseup', this._onDragEnd);
    },

    /**
     * Перемещение изображения относительно кадра.
     * @param {number} x
     * @param {number} y
     * @private
     */
    updatePosition: function(x, y) {
      this.moveConstraint(
          this._cursorPosition.x - x,
          this._cursorPosition.y - y);
      this._cursorPosition = new Coordinate(x, y);
    },

    /**
     * @param {MouseEvent} evt
     * @private
     */
    _onDragStart: function(evt) {
      this._enterDragMode(evt.clientX, evt.clientY);
    },

    /**
     * Обработчик окончания перетаскивания.
     * @private
     */
    _onDragEnd: function() {
      this._exitDragMode();
    },

    /**
     * Обработчик события перетаскивания.
     * @param {MouseEvent} evt
     * @private
     */
    _onDrag: function(evt) {
      this.updatePosition(evt.clientX, evt.clientY);
    },

    /**
     * Добавление элемента в DOM.
     * @param {Element} element
     */
    setElement: function(element) {
      if (this._element === element) {
        return;
      }

      this._element = element;
      this._element.insertBefore(this._container, this._element.firstChild);
      // Обработчики начала и конца перетаскивания.
      this._container.addEventListener('mousedown', this._onDragStart);
    },

    /**
     * Возвращает кадрирование элемента.
     * @return {Square}
     */
    getConstraint: function() {
      return this._resizeConstraint;
    },

    /**
     * Смещает кадрирование на значение указанное в параметрах.
     * @param {number} deltaX
     * @param {number} deltaY
     * @param {number} deltaSide
     */
    moveConstraint: function(deltaX, deltaY, deltaSide) {
      this.setConstraint(
          this._resizeConstraint.x + (deltaX || 0),
          this._resizeConstraint.y + (deltaY || 0),
          this._resizeConstraint.side + (deltaSide || 0));
    },

    /**
     * @param {number} x
     * @param {number} y
     * @param {number} side
     */
    setConstraint: function(x, y, side) {
      if (typeof x !== 'undefined') {
        this._resizeConstraint.x = x;
      }

      if (typeof y !== 'undefined') {
        this._resizeConstraint.y = y;
      }

      if (typeof side !== 'undefined') {
        this._resizeConstraint.side = side;
      }

      requestAnimationFrame(function() {
        this.redraw();
        window.dispatchEvent(new CustomEvent('resizerchange'));
      }.bind(this));
    },

    /**
     * Удаление. Убирает контейнер из родительского элемента, убирает
     * все обработчики событий и убирает ссылки.
     */
    remove: function() {
      this._element.removeChild(this._container);

      this._container.removeEventListener('mousedown', this._onDragStart);
      this._container = null;
    },

    /**
     * Экспорт обрезанного изображения как HTMLImageElement и исходником
     * картинки в src в формате dataURL.
     * @return {Image}
     */
    exportImage: function() {
      // Создаем Image, с размерами, указанными при кадрировании.
      var imageToExport = new Image();

      // Создается новый canvas, по размерам совпадающий с кадрированным
      // изображением, в него добавляется изображение взятое из канваса
      // с измененными координатами и сохраняется в dataURL, с помощью метода
      // toDataURL. Полученный исходный код, записывается в src у ранее
      // созданного изображения.
      var temporaryCanvas = document.createElement('canvas');
      var temporaryCtx = temporaryCanvas.getContext('2d');
      temporaryCanvas.width = this._resizeConstraint.side;
      temporaryCanvas.height = this._resizeConstraint.side;
      temporaryCtx.drawImage(this._image,
          -this._resizeConstraint.x,
          -this._resizeConstraint.y);
      imageToExport.src = temporaryCanvas.toDataURL('image/png');

      return imageToExport;
    }
  };

  /**
   * Вспомогательный тип, описывающий квадрат.
   * @constructor
   * @param {number} x
   * @param {number} y
   * @param {number} side
   * @private
   */
  var Square = function(x, y, side) {
    this.x = x;
    this.y = y;
    this.side = side;
  };

  /**
   * Вспомогательный тип, описывающий координату.
   * @constructor
   * @param {number} x
   * @param {number} y
   * @private
   */
  var Coordinate = function(x, y) {
    this.x = x;
    this.y = y;
  };

  window.Resizer = Resizer;
})();
