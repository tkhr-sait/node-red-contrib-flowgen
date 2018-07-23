
var should = require('chai').should()
var expect = require('chai').expect
var nodeRed = require('../lib/node-red.js')

describe('node-red', function () {
  describe('#isNode', function () {
    it('should true', function () {
      nodeRed.isNode('123', 'http in', {z: '123', type: 'http in'}).should.equals(true)
    })
    it('should false', function () {
      nodeRed.isNode('1234', 'http in', {z: '123', type: 'http in'}).should.equals(false)
    })
  })
  describe('#createFlowNode', function () {
    it('create ok', function () {
      node = nodeRed.createFlowNode('flow label')
      node.should.have.property('id')
      node.should.have.property('type').equal('tab')
      node.should.have.property('label').equal('flow label')
    })
  })
  describe('#createCommentNode', function () {
    it('create ok', function () {
      node = nodeRed.createCommentNode('123', 'comment title', 'comment detail', 10, 20)
      node.should.have.property('id')
      node.should.have.property('type').equal('comment')
      node.should.have.property('z').equal('123')
      node.should.have.property('name').equal('comment title')
      node.should.have.property('info').equal('comment detail')
      node.should.have.property('x').equal(10)
      node.should.have.property('y').equal(20)
    })
  })
  describe('#createHttpInNode', function () {
    it('create with swaggerDoc', function () {
      node = nodeRed.createHttpInNode('123', '456', '/url', 'post', 'spec', 10, 20)
      node.should.have.property('id')
      node.should.have.property('type').equal('http in')
      node.should.have.property('z').equal('123')
      node.should.have.property('url').equal('/url')
      node.should.have.property('method').equal('post')
      node.should.have.property('outputLabels').eql(['spec'])
      node.should.have.property('swaggerDoc').equal('456')
      node.should.have.property('x').equal(10)
      node.should.have.property('y').equal(20)
    })
    it('create without swaggerDoc', function () {
      node = nodeRed.createHttpInNode('123', '', '/url', 'post', 'spec', 10, 20)
      node.should.have.property('id')
      node.should.have.property('type').equal('http in')
      node.should.have.property('z').equal('123')
      node.should.have.property('url').equal('/url')
      node.should.have.property('method').equal('post')
      node.should.have.property('outputLabels').eql(['spec'])
      node.should.not.have.property('swaggerDoc')
      node.should.have.property('x').equal(10)
      node.should.have.property('y').equal(20)
    })
  })
  describe('#createFunctionNode', function () {
    it('create ok', function () {
      node = nodeRed.createFunctionNode('123', 'func', 10, 20)
      node.should.have.property('id')
      node.should.have.property('type').equal('function')
      node.should.have.property('z').equal('123')
      node.should.have.property('name').equal('example')
      node.should.have.property('func').equal('func')
      node.should.have.property('x').equal(10)
      node.should.have.property('y').equal(20)
    })
  })
  describe('#createHttpResponseNode', function () {
    it('create ok', function () {
      node = nodeRed.createHttpResponseNode('123', 10, 20)
      node.should.have.property('id')
      node.should.have.property('type').equal('http response')
      node.should.have.property('z').equal('123')
      node.should.have.property('x').equal(10)
      node.should.have.property('y').equal(20)
    })
  })
  describe('#createSwaggerDocNode', function () {
    it('create ok', function () {
      node = nodeRed.createSwaggerDocNode({})
      node.should.have.property('id')
      node.should.have.property('type').equal('swagger-doc')
      node.should.have.property('summary').equal('')
      node.should.have.property('description').equal('')
      node.should.have.property('tags').equal('')
      node.should.have.property('consumes').equal('')
      node.should.have.property('produces').equal('')
      node.should.have.property('deprecated').equal(false)
    })
  })
  describe('#createFunctionString', function () {
    it('create schema', function () {
      func = nodeRed.createFunctionString({
        responses: {
          'default': {
            headers: {
              'X-USER-ID': {
                example: 'user'
              }
            },
            schema: {
              type: 'object',
              properties: {
                value1: {
                  type: 'string',
                  example: 'test'
                },
                value2: {
                  type: 'int',
                  example: 2
                }
              }
            }
          }
        }
      })
      expect(func).equal('msg.statusCode = 200;\nmsg.headers = [{"X-USER-ID":"user"}];\nmsg.payload = {"value1":"test","value2":2};\nreturn msg;\n')
    })
    it('create example', function () {
      func = nodeRed.createFunctionString({
        responses: {
          'default': {
            headers: {
              'X-USER-ID': {
                example: 'user'
              }
            },
            examples: {
              "application/json": {
                value1: 'test',
                value2: 2
              }
            }
          }
        }
      })
      expect(func).equal('msg.statusCode = 200;\nmsg.headers = [{"X-USER-ID":"user"}];\nmsg.payload = {"value1":"test","value2":2};\nreturn msg;\n')
    })
    it('create null', function () {
      func = nodeRed.createFunctionString({})
      expect(func).equal('msg.headers = \'\';\nmsg.payload = \'\';\nreturn msg;\n')
    })
  })
  describe('#convertUrl', function () {
    it('parameter', function () {
      nodeRed.convertUrl('', '/url/{param}').should.equals('/url/:param')
    })
    it('parameter2', function () {
      nodeRed.convertUrl('', '/url/{param}/hoge/{param2}').should.equals('/url/:param/hoge/:param2')
    })
  })
  describe('#removeNodes', function () {
    it('removeNodes', function () {
      node = nodeRed.removeNodes([{id: '123'}, {id: '456'}, {id: '789'}], ['456'])
      expect(node).to.deep.include({id: '123'})
      expect(node).to.deep.not.include({id: '456'})
      expect(node).to.deep.include({id: '789'})
    })
  })
})
