/**
 * --------------------------------------------------------------------------
 * Bootstrap (v4.3.1): toast.js
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * --------------------------------------------------------------------------
 */

import {
  jQuery as $,
  TRANSITION_END,
  emulateTransitionEnd,
  getTransitionDurationFromElement,
  typeCheckConfig,
  makeArray
} from './util/index'
import Data from './dom/data'
import EventHandler from './dom/event-handler'
import Manipulator from './dom/manipulator'
import SelectorEngine from './dom/selector-engine'

/**
 * ------------------------------------------------------------------------
 * Constants
 * ------------------------------------------------------------------------
 */

const NAME = 'toast'
const VERSION = '4.3.1'
const DATA_KEY = 'bs.toast'
const EVENT_KEY = `.${DATA_KEY}`

const Event = {
  CLICK_DISMISS: `click.dismiss${EVENT_KEY}`,
  HIDE: `hide${EVENT_KEY}`,
  HIDDEN: `hidden${EVENT_KEY}`,
  SHOW: `show${EVENT_KEY}`,
  SHOWN: `shown${EVENT_KEY}`
}

const PositionMap = {
  TOP_RIGHT: 'top-right',
  TOP_LEFT: 'top-left',
  BOTTOM_RIGHT: 'bottom-right',
  BOTTOM_LEFT: 'bottom-left'
}

const ClassName = {
  FADE: 'fade',
  HIDE: 'hide',
  SHOW: 'show',
  SHOWING: 'showing',
  TOP_RIGHT: 'top-right',
  TOP_LEFT: 'top-left',
  BOTTOM_RIGHT: 'bottom-right',
  BOTTOM_LEFT: 'bottom-left'
}

const DefaultType = {
  animation: 'boolean',
  autohide: 'boolean',
  delay: 'number',
  position: 'string',
  positionMargin: 'number'
}

const Default = {
  animation: true,
  autohide: true,
  delay: 500,
  position: PositionMap.TOP_RIGHT,
  positionMargin: 10
}

const Selector = {
  DATA_DISMISS: '[data-dismiss="toast"]'
}

/**
 * ------------------------------------------------------------------------
 * Class Definition
 * ------------------------------------------------------------------------
 */

class Toast {
  constructor(element, config) {
    this._element = element
    this._config = this._getConfig(config)
    this._timeout = null
    this._setListeners()
    Data.setData(element, DATA_KEY, this)
  }

  // Getters

  static get VERSION() {
    return VERSION
  }

  static get DefaultType() {
    return DefaultType
  }

  static get Default() {
    return Default
  }

  // Public

  get config() {
    return this._config
  }

  show() {
    const showEvent = EventHandler.trigger(this._element, Event.SHOW)

    if (showEvent.defaultPrevented) {
      return
    }

    if (this._config.animation) {
      this._element.classList.add(ClassName.FADE)
    }

    const complete = () => {
      this._element.classList.remove(ClassName.SHOWING)
      this._element.classList.add(ClassName.SHOW)

      EventHandler.trigger(this._element, Event.SHOWN)

      if (this._config.autohide) {
        this._timeout = setTimeout(() => {
          this.hide()
        }, this._config.delay)
      }
    }

    this._positionToast()
    this._element.classList.remove(ClassName.HIDE)
    this._element.classList.add(ClassName.SHOWING)
    if (this._config.animation) {
      const transitionDuration = getTransitionDurationFromElement(this._element)

      EventHandler.one(this._element, TRANSITION_END, complete)
      emulateTransitionEnd(this._element, transitionDuration)
    } else {
      complete()
    }
  }

  hide() {
    if (!this._element.classList.contains(ClassName.SHOW)) {
      return
    }

    const hideEvent = EventHandler.trigger(this._element, Event.HIDE)

    if (hideEvent.defaultPrevented) {
      return
    }

    const complete = () => {
      this._element.classList.add(ClassName.HIDE)
      EventHandler.trigger(this._element, Event.HIDDEN)
      this._clearPositioning()
      this._repositionExistingToasts()
    }

    this._element.classList.remove(ClassName.SHOW)
    if (this._config.animation) {
      const transitionDuration = getTransitionDurationFromElement(this._element)

      EventHandler.one(this._element, TRANSITION_END, complete)
      emulateTransitionEnd(this._element, transitionDuration)
    } else {
      complete()
    }
  }

  dispose() {
    clearTimeout(this._timeout)
    this._timeout = null

    if (this._element.classList.contains(ClassName.SHOW)) {
      this._element.classList.remove(ClassName.SHOW)
    }

    EventHandler.off(this._element, Event.CLICK_DISMISS)
    Data.removeData(this._element, DATA_KEY)

    this._element = null
    this._config = null
  }

  // Private

  _positionToast() {
    this._element.style.position = 'absolute'
    const toastList = makeArray(SelectorEngine.find(`.toast.${this._config.position}`, this._element.parentNode))

    if (this._config.position === PositionMap.TOP_RIGHT || this._config.position === PositionMap.TOP_LEFT) {
      const top = toastList.reduce((top, toastEl) => {
        const { height, marginBottom } = window.getComputedStyle(toastEl)

        top += (parseInt(height, 10) + parseInt(marginBottom, 10))
        return top
      }, this._config.positionMargin)

      if (this._config.position === PositionMap.TOP_RIGHT) {
        this._element.classList.add(ClassName.TOP_RIGHT)
        this._element.style.right = `${this._config.positionMargin}px`
      } else {
        this._element.classList.add(ClassName.TOP_LEFT)
        this._element.style.left = `${this._config.positionMargin}px`
      }

      this._element.style.top = `${top}px`
      return
    }

    if (this._config.position === PositionMap.BOTTOM_RIGHT || this._config.position === PositionMap.BOTTOM_LEFT) {
      const bottom = toastList.reduce((bottom, toastEl) => {
        const { height, marginTop } = window.getComputedStyle(toastEl)

        bottom += (parseInt(height, 10) + parseInt(marginTop, 10))
        return bottom
      }, this._config.positionMargin)

      if (this._config.position === PositionMap.BOTTOM_RIGHT) {
        this._element.classList.add(ClassName.BOTTOM_RIGHT)
        this._element.style.right = `${this._config.positionMargin}px`
      } else {
        this._element.classList.add(ClassName.BOTTOM_LEFT)
        this._element.style.left = `${this._config.positionMargin}px`
      }

      this._element.style.bottom = `${bottom}px`
    }
  }

  _repositionExistingToasts() {
    const toastList = makeArray(SelectorEngine.find(`.toast.${this._config.position}`, this._element.parentNode))

    toastList.forEach((toastEl, index) => {
      const toastInstance = Toast._getInstance(toastEl)

      if (toastInstance.config.position === PositionMap.TOP_RIGHT || toastInstance.config.position === PositionMap.TOP_LEFT) {
        let top = toastInstance.config.positionMargin

        if (index > 0) {
          const previousToast = toastList[index - 1]
          const { height, marginBottom } = window.getComputedStyle(previousToast)

          top += (parseInt(height, 10) + parseInt(marginBottom, 10))
        }

        toastEl.style.top = `${top}px`
      }

      if (toastInstance.config.position === PositionMap.BOTTOM_RIGHT || toastInstance.config.position === PositionMap.BOTTOM_LEFT) {
        let bottom = toastInstance.config.positionMargin

        if (index > 0) {
          const previousToast = toastList[index - 1]
          const { height, marginTop } = window.getComputedStyle(previousToast)

          bottom += (parseInt(height, 10) + parseInt(marginTop, 10))
        }

        toastEl.style.bottom = `${bottom}px`
      }
    })
  }

  _clearPositioning() {
    this._element.style.position = 'relative'

    if (this._config.position === PositionMap.TOP_RIGHT || this._config.position === PositionMap.TOP_LEFT) {
      this._element.style.right = ''
      this._element.style.left = ''
      this._element.style.top = ''
      this._element.classList.remove(ClassName.TOP_RIGHT)
      this._element.classList.remove(ClassName.TOP_LEFT)

      return
    }

    if (this._config.position === PositionMap.BOTTOM_RIGHT || this._config.position === PositionMap.BOTTOM_LEFT) {
      this._element.style.right = ''
      this._element.style.left = ''
      this._element.style.bottom = ''
      this._element.classList.remove(ClassName.BOTTOM_LEFT)
      this._element.classList.remove(ClassName.BOTTOM_RIGHT)
    }
  }

  _getConfig(config) {
    config = {
      ...Default,
      ...Manipulator.getDataAttributes(this._element),
      ...typeof config === 'object' && config ? config : {}
    }

    typeCheckConfig(
      NAME,
      config,
      this.constructor.DefaultType
    )

    return config
  }

  _setListeners() {
    EventHandler.on(
      this._element,
      Event.CLICK_DISMISS,
      Selector.DATA_DISMISS,
      () => this.hide()
    )
  }

  // Static

  static _jQueryInterface(config) {
    return this.each(function () {
      let data = Data.getData(this, DATA_KEY)
      const _config = typeof config === 'object' && config

      if (!data) {
        data = new Toast(this, _config)
      }

      if (typeof config === 'string') {
        if (typeof data[config] === 'undefined') {
          throw new TypeError(`No method named "${config}"`)
        }

        data[config](this)
      }
    })
  }

  static _getInstance(element) {
    return Data.getData(element, DATA_KEY)
  }
}

/**
 * ------------------------------------------------------------------------
 * jQuery
 * ------------------------------------------------------------------------
 *  add .toast to jQuery only if jQuery is present
 */

if (typeof $ !== 'undefined') {
  const JQUERY_NO_CONFLICT = $.fn[NAME]
  $.fn[NAME] = Toast._jQueryInterface
  $.fn[NAME].Constructor = Toast
  $.fn[NAME].noConflict = () => {
    $.fn[NAME] = JQUERY_NO_CONFLICT
    return Toast._jQueryInterface
  }
}

export default Toast
