import React from 'react'
import ReactDOM from 'react-dom'
import TestUtils from 'react-addons-test-utils'

import styleable from '../styleable'

const css = {
  content: 'someHashFromALocalCssModule'
}

function mkFixture(css) {
  @styleable(css)
  class Subject extends React.Component {
    render() {
      return (
        <div className={this.props.css.content} ref="content">Content</div>
      )
    }
  }

  return Subject
}

function mkFunctionFixture(css) {
  function subject(props) {
    return <div className={props.css.content}>Content</div>
  }

  return styleable(css)(subject)
}

describe('styleable', () => {

  it('creates a default stylesheet if none supplied', () => {
    const defaultStylesheet = {}
    const Subject = mkFixture()
    const component = TestUtils.renderIntoDocument(<Subject />)
    component.props.css.should.eql(defaultStylesheet)
  })

  describe('with invalid stylesheet', () => {

    it('rejects css as strings', () => {
      (() => {
        const Subject = mkFixture('nonCssObj')
        TestUtils.renderIntoDocument(<Subject />)
      }).should.throw(/must be an object/)
    })

    it('rejects css as array', () => {
      (() => {
        const Subject = mkFixture(['css', 'stuff'])
        TestUtils.renderIntoDocument(<Subject />)
      }).should.throw(/must be an object/)
    })

  })

  it('wraps the component in a component', () => {
    const Subject = mkFixture()
    const component = TestUtils.renderIntoDocument(<Subject />)
    component.refs.should.not.have.property('content')
    component.refs.should.have.property('wrapped')
  })

  describe('with invalid override selectors', () => {

    it('rejects styles that won\'t be used (superset override)', (done) => {
      const origCss = { content: 'hash' }
      const overrideCss = { unusedSelector: 'anotherHash' }
      const Subject = mkFixture(origCss)
      try {
        TestUtils.renderIntoDocument(<Subject css={overrideCss}/>)
      } catch (e) {
        /*
          Using this instead of (() => {}).should.throw()
          Because I was getting this error:
           TypeError: Cannot call a class as a function
             at _classCallCheck (lib/styleable.js:23:34)
             at CssStyleComponent (lib/styleable.js:31:35)
             at Context.<anonymous> (lib/__specs__/styleable.spec.js:64:41)
         */
        e.message.should.match(/provide only overrides/)
        done()
      }
    })

  })

  it('overrides original stylesheet', () => {
    const newHash = 'anotherHash'
    const origCss = { content: 'hash' }
    const overrideCss = { content: newHash }
    const Subject = mkFixture(origCss)
    var component = TestUtils.renderIntoDocument(<Subject css={overrideCss}/>)
    component.props.css.content.should.eql(newHash )
  })

  describe('with stateless functions', () => {

    it('makes the css prop available', () => {
      const css = { content: 'cssHash' }
      const Subject = mkFunctionFixture(css)
      const component = TestUtils.renderIntoDocument(<div><Subject /></div>)
      ReactDOM.findDOMNode(component).children[0].className.should.eql(css.content)
    })

    it('allows overrides to the stylesheet', () => {
      const newHash = 'anotherHash'
      const origCss = { content: 'hash' }
      const overrideCss = { content: newHash }
      const Subject = mkFunctionFixture(origCss)
      const component = TestUtils.renderIntoDocument(<div><Subject css={overrideCss} /></div>)
      ReactDOM.findDOMNode(component).children[0].className.should.eql(newHash)
    })

  })

})