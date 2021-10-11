/*!
* BDD specs
*/

/* global
describe,
beforeEach,
it,
expect,
Event,
UIEvent,
KeyboardEvent,
MouseEvent,
WheelEvent,
FocusEvent,
CustomEvent
*/

/* eslint-disable no-unused-expressions */
/* jshint -W030 */

describe('DOM', () => {
  const dom = window.dom
  const test = document.getElementById('test')

  beforeEach(() => {
    test.innerHTML = ''
  })

  it('should get the type of a node', () => {
    expect(dom.getType(document)).to.equal('document')
    expect(dom.getType(document.body)).to.equal('element')
    expect(dom.getType(document.doctype)).to.equal('doctype')
    expect(dom.getType(document.createTextNode(''))).to.equal('text')
    expect(dom.getType(document.createComment(''))).to.equal('comment')
    expect(dom.getType(document.createDocumentFragment())).to.equal('fragment')
  })

  it('should check if a value is a node', () => {
    expect(dom.isNode(document)).to.be.true
    expect(dom.isNode(document.body)).to.be.true
    expect(dom.isNode(null)).to.be.false
    expect(dom.isNode({})).to.be.false
  })

  it('should check if a node is an element', () => {
    expect(dom.isElement(document.body)).to.be.true
    expect(dom.isElement(document)).to.be.false
    expect(dom.isElement(document.createTextNode(''))).to.be.false
  })

  it('should check if a node is a text node', () => {
    expect(dom.isText(document.createTextNode(''))).to.be.true
    expect(dom.isText(document)).to.be.false
    expect(dom.isText(document.body)).to.be.false
  })

  it('should check if a node is a processing instruction', () => {
    expect(dom.isInstruction(document.createProcessingInstruction('test', ''))).to.be.true
    expect(dom.isInstruction(document)).to.be.false
    expect(dom.isInstruction(document.body)).to.be.false
  })

  it('should check if a node is a comment', () => {
    expect(dom.isComment(document.createComment(''))).to.be.true
    expect(dom.isComment(document)).to.be.false
    expect(dom.isComment(document.body)).to.be.false
  })

  it('should check if a node is a document', () => {
    expect(dom.isDocument(document)).to.be.true
    expect(dom.isDocument(document.body)).to.be.false
    expect(dom.isDocument(document.createTextNode(''))).to.be.false
  })

  it('should check if a node is a doctype', () => {
    expect(dom.isDoctype(document.doctype)).to.be.true
    expect(dom.isDoctype(document)).to.be.false
    expect(dom.isDoctype(document.body)).to.be.false
  })

  it('should check if a node is a document fragment', () => {
    expect(dom.isFragment(document.createDocumentFragment())).to.be.true
    expect(dom.isFragment(document)).to.be.false
    expect(dom.isFragment(document.body)).to.be.false
  })

  it('should run a function when the document is ready', (done) => {
    dom.ready(done)
  })

  it('should query element by a selector', () => {
    expect(dom.query('#test')).to.equal(test)
  })

  it('should query all elements by a selector', () => {
    test.innerHTML = '<p></p><span></span><p></p>'

    expect(dom.queryAll('p', test)).to.have.lengthOf(2)
  })

  it('should create an element with attributes and content', () => {
    const element = dom.element('div', {
      class: 'test',
      _text: 'text',
    })

    expect(element).to.be.an.instanceof(Element)
    expect(element).to.have.property('className', 'test')
    expect(element).to.have.property('textContent', 'text')
  })

  it('should create a text node', () => {
    const node = dom.text('test')

    expect(node).to.be.an.instanceof(Text)
    expect(node).to.have.property('textContent', 'test')
  })

  it('should create a comment node', () => {
    const node = dom.comment('test')

    expect(node).to.be.an.instanceof(Comment)
    expect(node).to.have.property('textContent', 'test')
  })

  it('should create a document fragment from a template', () => {
    const fragment = dom.fragment('<p id="foo"></p>')

    expect(fragment).to.be.an.instanceof(DocumentFragment)
    expect(fragment.firstChild).to.have.property('id', 'foo')
  })

  it('should create a document range', () => {
    expect(dom.range()).to.be.an.instanceof(Range)
  })

  it('should add CSS classes to an element', () => {
    const element = document.createElement('p')

    element.className = 'foo'
    dom.addClass(element, 'bar')
    dom.addClass(element, ['baz'])

    expect(element.className).to.equal('foo bar baz')
  })

  it('should remove CSS classes from an element', () => {
    const element = document.createElement('p')

    element.className = 'foo bar baz'
    dom.removeClass(element, 'foo')
    dom.removeClass(element, ['baz'])

    expect(element.className).to.equal('bar')
  })

  it('should toggle CSS classes on an element', () => {
    const element = document.createElement('p')

    element.className = 'foo bar'
    dom.toggleClass(element, 'foo')

    expect(element.className).to.equal('bar')
  })

  it('should check if an element has certain CSS classes', () => {
    const element = document.createElement('p')

    element.className = 'foo bar'

    expect(dom.hasClass(element, 'bar foo')).to.be.true
  })

  it('should set and get custom data on an element', () => {
    const element = document.createElement('p')

    dom.setData(element, 'test', true)

    expect(dom.getData(element, 'test')).to.equal('true')
  })

  it('should append child nodes to an element', () => {
    const element = document.createElement('p')

    dom.append(test, element)
    dom.append(test, '<p id="foo"></p>')

    expect(test.firstChild).to.equal(element)
    expect(test.lastChild).to.have.property('id', 'foo')
  })

  it('should prepend child nodes to an element', () => {
    const element = document.createElement('p')

    dom.prepend(test, '<p id="foo"></p>')
    dom.prepend(test, element)

    expect(test.firstChild).to.equal(element)
    expect(test.lastChild).to.have.property('id', 'foo')
  })

  it('should insert a node before a certain child node', () => {
    const element = document.createElement('p')

    test.innerHTML = '<p id="foo"></p><p id="bar"></p>'
    dom.before(test.firstChild, element)
    dom.before(test.lastChild, '<p id="baz"></p>')

    expect(test.firstChild).to.equal(element)
    expect(test.lastChild).to.have.property('id', 'bar')
  })

  it('should insert a node after a certain child node', () => {
    const element = document.createElement('p')

    test.innerHTML = '<p id="foo"></p><p id="bar"></p>'
    dom.after(test.lastChild, element)
    dom.after(test.firstChild, '<p id="baz"></p>')

    expect(test.lastChild).to.equal(element)
    expect(test.childNodes[1]).to.have.property('id', 'baz')
  })

  it('should remove a child node from an element', () => {
    const element = document.createElement('p')

    test.appendChild(element)
    dom.remove(element)

    expect(test.firstChild).to.be.null
  })

  it('should clear the contents of an element', () => {
    test.innerHTML = '<p></p><p></p>'
    dom.clear(test)

    expect(test.firstChild).to.be.null
  })

  it('should clone a node', () => {
    const element = document.createElement('p')

    expect(dom.clone(element)).to.be.an.instanceof(Element).and.not.equal(element)
  })

  it('should check if an element matches a CSS selector', () => {
    const element = document.createElement('p')

    element.id = 'foo'

    expect(dom.matches(element, '#foo')).to.be.true
    expect(dom.matches(element, 'div')).to.be.false
  })

  it('should find the closest ancestor element that matches a CSS selector', () => {
    test.innerHTML = '<div><p><span></span></p></div>'

    const foo = test.firstChild
    const bar = foo.firstChild
    const baz = bar.firstChild

    expect(dom.closest(baz, 'div')).to.equal(foo)
    expect(dom.closest(bar, 'p')).to.equal(bar)
  })

  it('should iterate over child elements', () => {
    const elements = []

    test.innerHTML = '<p></p><p></p><p></p>'
    dom.each(test, (element) => elements.push(element))

    expect(elements).to.have.lengthOf(3)
    expect(elements[0]).to.have.property('parentNode', test)
    expect(elements[1]).to.have.property('parentNode', test)
    expect(elements[2]).to.have.property('parentNode', test)
  })

  it('should add an event listener to an element, and remove the listener', () => {
    const element = document.createElement('p')

    let listener = null

    element.addEventListener = function addEventListener(name, callback, capture) {
      listener = { name, callback, capture }
    }

    element.removeEventListener = function removeEventListener(name, callback, capture) {
      if (listener.name === name && listener.callback === callback && listener.capture === capture) {
        listener = null
      }
    }

    dom.on(element, 'click', function onClick() {
      expect(listener).to.be.an.instanceof(Object)
      dom.off(element, 'click', onClick)
      expect(listener).to.be.null
    })

    listener.callback()
  })

  it('should trigger an event on an element', () => {
    const element = document.createElement('p')

    let listener = null

    element.addEventListener = function addEventListener(name, callback, capture) {
      listener = { name, callback, capture }
    }

    element.removeEventListener = function removeEventListener(name, callback, capture) {
      if (listener.name === name && listener.callback === callback && listener.capture === capture) {
        listener = null
      }
    }

    element.dispatchEvent = function dispatchEvent(event) {
      if (listener && event.name === listener.name) {
        listener.callback.call(undefined, event)
      }
    }

    let called = false

    element.addEventListener('click', function onClick() {
      element.removeEventListener('click', onClick, false)
      called = true
    }, false)

    dom.trigger(element, { name: 'click' })
    expect(called).to.be.true
  })

  it('should create custom event objects', () => {
    expect(dom.event('event', 'test')).to.be.an.instanceof(Event)
    expect(dom.event('ui', 'test')).to.be.an.instanceof(UIEvent)
    expect(dom.event('keyboard', 'keydown')).to.be.an.instanceof(KeyboardEvent)
    expect(dom.event('mouse', 'click')).to.be.an.instanceof(MouseEvent)
    expect(dom.event('wheel', 'wheel')).to.be.an.instanceof(WheelEvent)
    expect(dom.event('focus', 'focus')).to.be.an.instanceof(FocusEvent)
    expect(dom.event('custom', 'test')).to.be.an.instanceof(CustomEvent)
  })

  it('should request an animation frame', (done) => {
    dom.anim(() => done())
  })
})
