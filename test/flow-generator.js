
var should = require('chai').should()
var expect = require('chai').expect
var flowGenerator = require('../lib/flow-generator.js')

describe('flow-generator', function () {
  describe('#calcMaxY', function () {
    it('none', function () {
      y = flowGenerator.calcMaxY([], '123', 50)
      expect(y).equals(50)
    })
    it('update max', function () {
      y = flowGenerator.calcMaxY([
        {z: '123', y: 49},
        {z: '123', y: 51},
        {z: '123', y: 101},
        {z: '1234', y: 52}], '123', 50)
      expect(y).equals(151)
    })
  })
  describe('#collectApis', function () {
    it('none', function () {
      apis = flowGenerator.collectApis([], '123')
      expect(apis).length(0)
    })
    it('collect', function () {
      apis = flowGenerator.collectApis([
        {z: '123', type: 'http in', url: '/url', method: 'post'},
        {z: '123', type: 'comment', url: '/url2', method: 'post'},
        {z: '1234', type: 'http in', url: '/url3', method: 'post'}
      ], '123')
      expect(apis).length(1)
    })
  })
  describe('#generate', function () {
    it('none', function () {
      json = flowGenerator.generate([], '123', [], false, [], false, 0, 0, 0, 0)
      expect(json).length(0)
    })
    it('generate added. no merge & no swaggerDoc', function () {
      json = flowGenerator.generate([], '123', {
        paths: {'/url': {'get': {}}}
      }, false, [], false, 0, 0, 0, 0)
      expect(json).length(4)
    })
    it('generate modified. merge & no swaggerDoc', function () {
      json = flowGenerator.generate([
        {z: '123', type: 'comment', x: 0, y: 0},
        {z: '123', type: 'http in', url: '/url', method: 'get', x: 0, y: 25}
      ], '123', {
        paths: {'/url': {'get': {}}}
      }, true, [
        '/url,get'
      ], false, 100, 0, 0, 0)
      expect(json).length(1)
    })
    it('generate deleted. merge & no swaggerDoc', function () {
      json = flowGenerator.generate([
        {z: '123', type: 'http in', url: '/url', method: 'get'},
        {z: '123', type: 'http in', url: '/url', method: 'post'},
      ], '123', {
      }, true, [
        '/url,get'
      ], false, 0, 0, 0, 0)
      expect(json).length(3)
    })
    it('generate added. no merge & swaggerDoc', function () {
      json = flowGenerator.generate([], '123', {
        paths: {'/url': {'get': {}}}
      }, false, [], true, 0, 0, 0, 0)
      expect(json).length(5)
    })
    it('generate modified. merge & swaggerDoc', function () {
      json = flowGenerator.generate([
        {z: '123', type: 'http in', url: '/url', method: 'get'},
      ], '123', {
        paths: {'/url': {'get': {}}}
      }, true, [], true, 0, 0, 0, 0)
      expect(json).length(3)
    })
    it('generate modified. merge function & swaggerDoc', function () {
      json = flowGenerator.generate([
        {z: '123', type: 'http in', url: '/url', method: 'get', swaggerDoc: '456', wires: [['789']]},
        {z: '123', id: '789', type: 'function', name: 'example'},
      ], '123', {
        paths: {'/url': {'get': {}}}
      }, true, [], true, 0, 0, 0, 0)
      expect(json).length(4)
    })
    it('generate modified. merge & no swaggerDoc', function () {
      json = flowGenerator.generate([
        {z: '123', type: 'comment', x: 0, y: 0},
        {z: '123', type: 'http in', url: '/url', method: 'get', outputLabels: ['{}'], x: 0, y: 25}
      ], '123', {
        paths: {'/url': {'get': {}}}
      }, true, [
        '/url,get'
      ], false, 100, 0, 0, 0)
      expect(json).length(2)
    })
  })
})
