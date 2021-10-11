/*!
 * Minimal DOM
 * Version 1.0.0
 *
 * Tomas Enarsson
 */

// Node types
// https://developer.mozilla.org/en-US/docs/Web/API/Node/nodeType
const nodeTypes = [

  '', // 0
  'element', // 1
  'attribute', // 2 (deprecated)
  'text', // 3
  'cdata', // 4 (CDATA section - deprecated)
  'reference', // 5 (entity reference - deprecated)
  'entity', // 6 (deprecated)
  'instruction', // 7 (processing instruction)
  'comment', // 8
  'document', // 9
  'doctype', // 10 (document type)
  'fragment', // 11 (document fragment)
  'notation', // 12 (deprecated)
]

// Empty document range for parsing HTML fragments
let docRange = null

// Element for creating nodes
let nodeFactory = null

// Export
const dom = {

  /**
   * Returns the type of a node.
   *
   * @public
   * @param {Node} node
   * @returns {string}
   */
  getType(node) {
    return (nodeTypes[node.nodeType] || '')
  },

  /**
   * Returns true if value is a node.
   *
   * @public
   * @param {*} value
   * @returns {boolean}
   */
  isNode(value) {
    return (isObject(value) && value.nodeType >= 1 && value.nodeType <= 12)
  },

  /**
   * Returns true if node is an element.
   *
   * @public
   * @param {Node} node
   * @returns {boolean}
   */
  isElement(node) {
    return (node.nodeType === 1)
  },

  /**
   * Returns true if node is a text node.
   *
   * @public
   * @param {Node} node
   * @returns {boolean}
   */
  isText(node) {
    return (node.nodeType === 3)
  },

  /**
   * Returns true if node is a processing instruction.
   *
   * @public
   * @param {Node} node
   * @returns {boolean}
   */
  isInstruction(node) {
    return (node.nodeType === 7)
  },

  /**
   * Returns true if node is a comment.
   *
   * @public
   * @param {Node} node
   * @returns {boolean}
   */
  isComment(node) {
    return (node.nodeType === 8)
  },

  /**
   * Returns true if node is a document.
   *
   * @public
   * @param {Node} node
   * @returns {boolean}
   */
  isDocument(node) {
    return (node.nodeType === 9)
  },

  /**
   * Returns true if node is a document type.
   *
   * @public
   * @param {Node} node
   * @returns {boolean}
   */
  isDoctype(node) {
    return (node.nodeType === 10)
  },

  /**
   * Returns true if node is a document fragment.
   *
   * @public
   * @param {Node} node
   * @returns {boolean}
   */
  isFragment(node) {
    return (node.nodeType === 11)
  },

  /**
   * Calls a function when the DOM is ready.
   *
   * @see https://developer.mozilla.org/en-US/docs/Web/Events/DOMContentLoaded
   *
   * @public
   * @param {Function} callback
   */
  ready(callback) {
    if (document.readyState !== 'loading') {
      setTimeout(callback, 1)
      return
    }

    const eventName = 'DOMContentLoaded'

    dom.on(document, eventName, function onDocumentReady() {
      dom.off(document, eventName, onDocumentReady)
      callback()
    })
  },

  /**
   * Returns the first element that matches a CSS selector.
   *
   * @see https://developer.mozilla.org/en-US/docs/Web/API/Document/querySelector
   * @see https://developer.mozilla.org/en-US/docs/Web/API/Element/querySelector
   *
   * @public
   * @param {string} selector
   * @param {string|Element|DocumentFragment|Document = document} parent
   * @returns {Element|null}
   */
  query(selector, parent) {
    parent = (parent ? resolveNode(parent) : document)

    return parent.querySelector(selector)
  },

  /**
   * Returns all elements that matches a CSS selector.
   *
   * @see https://developer.mozilla.org/en-US/docs/Web/API/Document/querySelectorAll
   * @see https://developer.mozilla.org/en-US/docs/Web/API/Element/querySelectorAll
   *
   * @public
   * @param {string} selector
   * @param {string|Element|DocumentFragment|Document = document} parent
   * @returns {Element[]}
   */
  queryAll(selector, parent) {
    parent = (parent ? resolveNode(parent) : document)

    return Array.from(parent.querySelectorAll(selector))
  },

  /**
   * Creates a new element.
   *
   * @see https://developer.mozilla.org/en-US/docs/Web/API/Document/createElement
   *
   * @public
   * @param {string} tagName
   * @param {Object = undefined} attributes
   * @returns {Element}
   */
  element(tagName, attributes) {
    const newElement = document.createElement(tagName)

    if (attributes) {
      dom.setup(newElement, attributes)
    }

    return newElement
  },

  /**
   * Creates a new text node.
   *
   * @see https://developer.mozilla.org/en-US/docs/Web/API/Document/createTextNode
   *
   * @public
   * @param {string = ""} string
   * @returns {Text}
   */
  text(string = '') {
    return document.createTextNode(string)
  },

  /**
   * Creates a new comment node.
   *
   * @see https://developer.mozilla.org/en-US/docs/Web/API/Document/createComment
   *
   * @public
   * @param {string = ""} string
   * @returns {Comment}
   */
  comment(string = '') {
    return document.createComment(string)
  },

  /**
   * Creates a new document fragment from a template.
   *
   * @see https://developer.mozilla.org/en-US/docs/Web/API/Document/createDocumentFragment
   * @see https://developer.mozilla.org/en-US/docs/Web/API/Document/importNode
   * @see https://developer.mozilla.org/en-US/docs/Web/API/Node/cloneNode
   *
   * @public
   * @param {string|Node|NodeList|Node[] = undefined} template
   * @returns {DocumentFragment}
   */
  fragment(template) {
    if (!template || isString(template)) {
      return createFragment(template)
    }

    let docFragment
    let nodes = null

    if (dom.isElement(template)) {
      const content = template.content

      if (dom.isFragment(content)) {
        docFragment = document.importNode(content, true)
      } else {
        docFragment = createFragment()
        nodes = Array.from(template.childNodes)
      }
    } else if (dom.isFragment(template)) {
      docFragment = template.cloneNode(true)
    } else {
      docFragment = createFragment()
      nodes = (Array.isArray(template) ? template : Array.from(template))
    }

    if (nodes) {
      nodes.forEach((node) => docFragment.appendChild(node.cloneNode(true)))
    }

    return docFragment
  },

  /**
   * Creates a new document range.
   *
   * @see https://developer.mozilla.org/en-US/docs/Web/API/Document/createRange
   *
   * @public
   * @param {Node = null} startNode
   * @param {number = 0} startOffset
   * @param {Node = null} endNode
   * @param {number = 0} endOffset
   * @returns {Range}
   */
  range(startNode = null, startOffset = 0, endNode = null, endOffset = 0) {
    const range = document.createRange()

    if (startNode) {
      if (endNode) {
        range.setStart(startNode, startOffset)
        range.setEnd(endNode, endOffset)
      } else {
        range.selectNode(startNode)
      }
    }

    return range
  },

  /**
   * Sets attributes and contents of an element.
   *
   * @see https://developer.mozilla.org/en-US/docs/Web/API/Element/setAttribute
   * @see https://developer.mozilla.org/en-US/docs/Web/API/Element/innerHTML
   * @see https://developer.mozilla.org/en-US/docs/Web/API/Node/textContent
   *
   * @public
   * @param {string|Element} element
   * @param {Object} attributes
   * @returns {Element}
   */
  setup(element, attributes) {
    element = resolveNode(element)

    eachIn(attributes, (name, value) => {
      switch (name) {
        case '_text': element.textContent = value; break
        case '_html': element.innerHTML = value; break
        default: element.setAttribute(name, value)
      }
    })

    return element
  },

  /**
   * Adds CSS class names to an element.
   *
   * @see https://developer.mozilla.org/en-US/docs/Web/API/Element/classList
   *
   * @public
   * @param {string|Element} element
   * @param {string|string[]} classNames
   * @returns {Element}
   */
  addClass(element, classNames) {
    element = resolveNode(element)
    classNames = resolveNames(classNames)

    const classList = element.classList

    if (classList) {
      classNames.forEach((name) => classList.add(name))
    } else {
      const currentNames = getClassNames(element)
      let update = false

      classNames.forEach((name) => {
        if (currentNames.indexOf(name) < 0) {
          currentNames.push(name)
          update = true
        }
      })

      if (update) {
        element.className = currentNames.join(' ')
      }
    }

    return element
  },

  /**
   * Removes CSS class names from an element.
   *
   * @see https://developer.mozilla.org/en-US/docs/Web/API/Element/classList
   *
   * @public
   * @param {string|Element} element
   * @param {string|string[]} classNames
   * @returns {Element}
   */
  removeClass(element, classNames) {
    element = resolveNode(element)
    classNames = resolveNames(classNames)

    const classList = element.classList

    if (classList) {
      classNames.forEach((name) => classList.remove(name))
    } else {
      const currentNames = getClassNames(element)
      let update = false

      classNames.forEach((name) => {
        const i = currentNames.indexOf(name)

        if (i >= 0) {
          currentNames.splice(i, 1)
          update = true
        }
      })

      if (update) {
        element.className = currentNames.join(' ')
      }
    }

    return element
  },

  /**
   * Toggles CSS class names on an element.
   *
   * @see https://developer.mozilla.org/en-US/docs/Web/API/Element/classList
   *
   * @public
   * @param {string|Element} element
   * @param {string|string[]} classNames
   * @returns {Element}
   */
  toggleClass(element, classNames) {
    element = resolveNode(element)
    classNames = resolveNames(classNames)

    const classList = element.classList

    if (classList) {
      classNames.forEach((name) => classList.toggle(name))
    } else {
      const currentNames = getClassNames(element)

      classNames.forEach((name) => {
        const i = currentNames.indexOf(name)

        if (i < 0) {
          currentNames.push(name)
        } else {
          currentNames.splice(i, 1)
        }
      })

      element.className = currentNames.join(' ')
    }

    return element
  },

  /**
   * Returns true if element has the given CSS class names.
   *
   * @see https://developer.mozilla.org/en-US/docs/Web/API/Element/classList
   *
   * @public
   * @param {string|Element} element
   * @param {string|string[]} classNames
   * @returns {boolean}
   */
  hasClass(element, classNames) {
    element = resolveNode(element)
    classNames = resolveNames(classNames)

    const classList = element.classList

    if (classList) {
      return classNames.every((name) => classList.contains(name))
    }

    const currentNames = getClassNames(element)

    return classNames.every((name) => currentNames.indexOf(name) >= 0)
  },

  /**
   * Sets custom data attribute value on an element.
   *
   * @see https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/dataset
   *
   * @public
   * @param {string|Element} element
   * @param {string} key
   * @param {*} value
   * @returns {Element}
   */
  setData(element, key, value) {
    element = resolveNode(element)

    const dataset = element.dataset

    if (dataset) {
      dataset[key] = '' + value
    } else {
      element.setAttribute(toDataKey(key), '' + value)
    }

    return element
  },

  /**
   * Returns custom data attribute value from an element.
   *
   * @see https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/dataset
   *
   * @public
   * @param {string|Element} element
   * @param {string} key
   * @returns {string|undefined}
   */
  getData(element, key) {
    element = resolveNode(element)

    const dataset = element.dataset

    return (dataset ? dataset[key] : element.getAttribute(toDataKey(key)))
  },

  /**
   * Appends child node(s) to a parent node.
   *
   * @see https://developer.mozilla.org/en-US/docs/Web/API/Node/appendChild
   * @see https://developer.mozilla.org/en-US/docs/Web/API/Element/insertAdjacentHTML
   *
   * @public
   * @param {string|Element|DocumentFragment} parent
   * @param {string|Node} node
   * @returns {Element|DocumentFragment}
   */
  append(parent, node) {
    parent = resolveNode(parent)

    if (isString(node)) {
      parent.insertAdjacentHTML('beforeend', node)
    } else {
      parent.appendChild(node)
    }

    return parent
  },

  /**
   * Prepends child node(s) to a parent node.
   *
   * @see https://developer.mozilla.org/en-US/docs/Web/API/Node/insertBefore
   * @see https://developer.mozilla.org/en-US/docs/Web/API/Element/insertAdjacentHTML
   *
   * @public
   * @param {string|Element|DocumentFragment} parent
   * @param {string|Node} node
   * @returns {Element|DocumentFragment}
   */
  prepend(parent, node) {
    parent = resolveNode(parent)

    if (isString(node)) {
      parent.insertAdjacentHTML('afterbegin', node)
    } else {
      const first = parent.firstChild

      if (first) {
        parent.insertBefore(node, first)
      } else {
        parent.appendChild(node)
      }
    }

    return parent
  },

  /**
   * Inserts node(s) before a target node.
   *
   * @see https://developer.mozilla.org/en-US/docs/Web/API/Node/insertBefore
   * @see https://developer.mozilla.org/en-US/docs/Web/API/Element/insertAdjacentHTML
   *
   * @public
   * @param {string|Node} target
   * @param {string|Node} node
   * @returns {Node}
   */
  before(target, node) {
    target = resolveNode(target)

    if (isString(node)) {
      target.insertAdjacentHTML('beforebegin', node)
    } else {
      target.parentNode.insertBefore(node, target)
    }

    return target
  },

  /**
   * Inserts node(s) after a target node.
   *
   * @see https://developer.mozilla.org/en-US/docs/Web/API/Node/insertBefore
   * @see https://developer.mozilla.org/en-US/docs/Web/API/Element/insertAdjacentHTML
   *
   * @public
   * @param {string|Node} target
   * @param {string|Node} node
   * @returns {Node}
   */
  after(target, node) {
    target = resolveNode(target)

    if (isString(node)) {
      target.insertAdjacentHTML('afterend', node)
    } else {
      const parent = target.parentNode
      const next = target.nextSibling

      if (next) {
        parent.insertBefore(node, next)
      } else {
        parent.appendChild(node)
      }
    }

    return target
  },

  /**
   * Removes a node from the document.
   *
   * @see https://developer.mozilla.org/en-US/docs/Web/API/Node/removeChild
   *
   * @public
   * @param {string|Node} node
   * @returns {Node}
   */
  remove(node) {
    node = resolveNode(node)

    const parent = node.parentNode

    if (parent) {
      parent.removeChild(node)
    }

    return node
  },

  /**
   * Clears the contents of a parent node.
   *
   * @see https://developer.mozilla.org/en-US/docs/Web/API/Node/textContent
   *
   * @public
   * @param {string|Node} node
   * @returns {Node}
   */
  clear(node) {
    node = resolveNode(node)
    node.textContent = ''

    return node
  },

  /**
   * Creates a clone of a node.
   *
   * @see https://developer.mozilla.org/en-US/docs/Web/API/Node/cloneNode
   *
   * @public
   * @param {string|Node} node
   * @param {boolean = true} deep
   * @returns {Node}
   */
  clone(node, deep = true) {
    return resolveNode(node).cloneNode(deep)
  },

  /**
   * Returns true if an element matches a CSS selector.
   *
   * @see https://developer.mozilla.org/en-US/docs/Web/API/Element/matches
   *
   * @public
   * @param {Element} element
   * @param {string} selector
   * @returns {boolean}
   */
  matches(element, selector) {
    const matches = element.matches ||
      element.matchesSelector ||
      element.webkitMatchesSelector ||
      element.mozMatchesSelector ||
      element.msMatchesSelector ||
      element.oMatchesSelector

    if (!matches) {
      throw new Error('Method matches() is not supported')
    }

    return matches.call(element, selector)
  },

  /**
   * Returns the closest ancestor element (or same element) that matches a CSS selector.
   *
   * @see https://developer.mozilla.org/en-US/docs/Web/API/Element/closest
   *
   * @public
   * @param {string|Element} element
   * @param {string} selector
   * @returns {Element|null}
   */
  closest(element, selector) {
    element = resolveNode(element)

    if (element.closest) {
      return element.closest(selector)
    }

    while (element) {
      if (dom.matches(element, selector)) {
        return element
      }

      element = element.parentNode
    }

    return null
  },

  /**
   * Iterates over all child elements in a parent node.
   *
   * @see https://developer.mozilla.org/en-US/docs/Web/API/ParentNode/children
   *
   * @public
   * @param {string|Element|DocumentFragment} parent
   * @param {Function} callback - function(node) - this = parent
   * @returns {Element|DocumentFragment}
   */
  each(parent, callback) {
    parent = resolveNode(parent)
    Array.from(parent.children).forEach((element) => callback.call(parent, element))

    return parent
  },

  /**
   * Adds an event listener to an element.
   *
   * @see https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener
   *
   * @public
   * @param {string|Element} element
   * @param {string} eventName
   * @param {Function} callback
   * @returns {Element}
   */
  on(element, eventName, callback) {
    element = resolveNode(element)
    element.addEventListener(eventName, callback, false)

    return element
  },

  /**
   * Removes an event listener from an element.
   *
   * @see https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/removeEventListener
   *
   * @public
   * @param {string|Element} element
   * @param {string} eventName
   * @param {Function} callback
   * @returns {Element}
   */
  off(element, eventName, callback) {
    element = resolveNode(element)
    element.removeEventListener(eventName, callback, false)

    return element
  },

  /**
   * Triggers an event on a target and returns true if default action was not prevented.
   *
   * @see https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/dispatchEvent
   *
   * @public
   * @param {string|Element} element
   * @param {Event} event
   * @returns {boolean}
   */
  trigger(element, event) {
    return resolveNode(element).dispatchEvent(event)
  },

  /**
   * Creates a new event object.
   *
   * @see https://developer.mozilla.org/en-US/docs/Web/Events
   * @see https://developer.mozilla.org/en-US/docs/Web/Guide/Events/Creating_and_triggering_events
   *
   * @public
   * @param {string} type
   * @param {string} name
   * @param {Object = null} config
   * @returns {Event}
   */
  event(type, name, config = {}) {
    let args

    switch (type) {
      case 'event':
        type = ''
        args = []
        break

      case 'ui':
        type = 'UI'
        args = [
          config.view || null,
          config.detail || 0,
        ]
        break

      case 'keyboard':
        type = 'Keyboard'
        args = [
          config.view || null,
          config.key || '',
          config.location || 0,
          getEventModifiers(config),
          config.repeat || false,
          '', // locale
        ]
        break

      case 'mouse':
        type = 'Mouse'
        args = [
          config.view || null,
          config.detail || 0,
          config.screenX || 0,
          config.screenY || 0,
          config.clientX || 0,
          config.clientY || 0,
          config.ctrlKey || false,
          config.altKey || false,
          config.shiftKey || false,
          config.metaKey || false,
          config.button || 0,
          config.relatedTarget || null,
        ]
        break

      case 'wheel':
        type = 'Wheel'
        args = [
          config.view || null,
          config.detail || 0,
          config.screenX || 0,
          config.screenY || 0,
          config.clientX || 0,
          config.clientY || 0,
          config.button || 0,
          config.relatedTarget || null,
          getEventModifiers(config),
          config.deltaX || 0,
          config.deltaY || 0,
          config.deltaZ || 0,
          config.deltaMode || 0,
        ]
        break

      case 'focus':
        type = 'Focus'
        args = [
          config.view || null,
          config.detail || 0,
          config.relatedTarget || null,
        ]
        break

      case 'custom':
        type = 'Custom'
        args = [config.detail || null]
        break

      default: return null
    }

    type += 'Event'

    let event

    try {
      event = new window[type](name, config)
    } catch (err) {
      event = null
    }

    if (!event) {
      event = document.createEvent(type)

      event['init' + type].apply(event, [

        name,
        config.bubbles || false,
        config.cancelable || false,

      ].concat(args))
    }

    return event
  },

  /**
   * Registers a function to be called before the next browser repaint.
   *
   * @see https://developer.mozilla.org/en-US/docs/Web/API/window/requestAnimationFrame
   *
   * @public
   * @param {Function} callback
   * @returns {number}
   */
  anim(callback) {
    return window.requestAnimationFrame(callback)
  },
}

/**
 * Returns the node or the first element that matches a CSS selector.
 *
 * @private
 * @param {string|Node} node
 * @returns {Node|Element}
 */
function resolveNode(node) {
  return (isString(node) ? dom.query(node) : node)
}

/**
 * Returns an array of names.
 *
 * @private
 * @param {string|string[]} names
 * @returns {string[]}
 */
function resolveNames(names) {
  return (isString(names) ? names.split(' ') : names)
}

/**
 * Creates a new document fragment.
 *
 * @private
 * @param {string = ""} html
 * @returns {DocumentFragment}
 */
function createFragment(html = '') {
  if (!html) {
    return document.createDocumentFragment()
  }

  const range = getRange()
  const method = range.createContextualFragment

  if (method) {
    return method.call(range, html)
  }

  const fragment = document.createDocumentFragment()
  const factory = getNodeFactory()

  factory.innerHTML = html

  while (factory.firstChild) {
    fragment.appendChild(factory.firstChild)
  }

  return fragment
}

/**
 * Returns true if value is a string.
 *
 * @private
 * @param {*} value
 * @returns {boolean}
 */
function isString(value) {
  return (typeof value === 'string')
}

/**
 * Returns true if value is an object.
 *
 * @private
 * @param {*} value
 * @returns {boolean}
 */
function isObject(value) {
  return (value !== null && typeof value === 'object')
}

/**
 * Invokes callback for each property in an object.
 *
 * @private
 * @param {Object} object
 * @param {Function} callback
 */
function eachIn(object, callback) {
  Object.keys(object).forEach((key) => callback.call(object, key, object[key]))
}

/**
 * Returns a key for an element data attribute.
 *
 * @private
 * @param {string} key
 * @returns {string}
 */
function toDataKey(key) {
  return ('data-' + key.replace(/[A-Z]/g, (char) => '-' + char.toLowerCase()))
}

/**
 * Returns CSS class names for an element.
 *
 * @private
 * @deprecated
 * @param {Element} element
 * @returns {string[]}
 */
function getClassNames(element) {
  return element.className.trim().split(/ +/)
}

/**
 * Returns a collapsed document range.
 *
 * @private
 * @returns {Range}
 */
function getRange() {
  if (!docRange) {
    docRange = dom.range()
  }

  return docRange
}

/**
 * Returns an element for creating nodes.
 *
 * @private
 * @returns {Element}
 */
function getNodeFactory() {
  if (!nodeFactory) {
    nodeFactory = dom.element('div')
  }

  return nodeFactory
}

/**
 * Returns a string of space-separated event modifiers.
 *
 * @private
 * @param {Object} config
 * @returns {string}
 */
function getEventModifiers(config) {
  const modifiers = []

  if (config.ctrlKey) {
    modifiers.push('Control')
  }

  if (config.altKey) {
    modifiers.push('Alt')
  }

  if (config.shiftKey) {
    modifiers.push('Shift')
  }

  if (config.metaKey) {
    modifiers.push('Meta')
  }

  return modifiers.join(' ')
}

// Export
window.dom = dom
