
var should = require('chai').should()
var expect = require('chai').expect
var argparse = require('../lib/argparse.js')

describe('argparse', function () {
  describe('#parseArguments', function () {
    process.argv = [process.argv[0],process.argv[1],'-i','3','-o','4']
    var arg = argparse.parseArguments()
  })
})
