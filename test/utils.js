
var should = require('chai').should()
var expect = require('chai').expect
var util = require('../lib/utils.js')

describe('utils', function () {
  describe('#now', function () {
    it('now', function () {
      now = util.now()
      console.log(now)
      expect(now).should.not.equals('')
    })
  })
})
