#!/usr/bin/env node
var RED = require('node-red')
var fs = require('fs')
var SwaggerParser = require('swagger-parser')

if (process.argv.length !== 4) {
  console.error('usage: flowgen.js input output')
  process.exit(2)
}

var input = process.argv[2]
var output = process.argv[3]

// create flow
var flowId = RED.util.generateId()
var flowName = 'Swagger API'
var json = [{
  'id': flowId,
  'type': 'tab',
  'label': flowName,
  'disabled': false,
  'info': ''
}]

// create nodes
var x = 100
var y = 50
var templateString = ''

// read from swagger.json
SwaggerParser.validate(input)
  .then(function (api) {
    SwaggerParser.dereference(input)
      .then(function (api) {
        for (var path in api.paths) {
          for (var pathMethod in api.paths[path]) {
            console.log(api.basePath + path + '[' + pathMethod + ']')
            // TODO example
            templateString = ''
            createHttpNode(json, flowId, (api.basePath + path).replace(/\{[^}]*\}/g, '*'), pathMethod, templateString, x, y)
            y += 50
          }
        }
        var jsonstr = JSON.stringify(json, null, 4)
        fs.writeFileSync(output, jsonstr)
        console.log('generate flow success.')
        process.exit(0)
      })
  })
  .catch(function (err) {
    console.error(err)
    process.exit(2)
  })

// functions -------------------------------------------------------------------
function createHttpNode (json, flowId, url, method, templateString, x, y) {
  // create http nodes
  var httpInNodeId = RED.util.generateId()
  var templateNodeId = RED.util.generateId()
  var httpResponseNodeId = RED.util.generateId()
  var httpIn = {
    'id': httpInNodeId,
    'type': 'http in',
    'z': flowId,
    'name': '',
    'url': url,
    'method': method,
    'upload': false,
    'x': x,
    'y': y,
    'wires': [ [ templateNodeId ] ]
  }
  var template = {
    'id': templateNodeId,
    'type': 'template',
    'z': flowId,
    'name': '',
    'field': 'payload',
    'fieldType': 'msg',
    'format': 'handlebars',
    'syntax': 'plain',
    'template': templateString,
    'output': 'str',
    'x': x + 200,
    'y': y,
    'wires': [ [ httpResponseNodeId ] ]
  }
  var httpResponse = {
    'id': httpResponseNodeId,
    'type': 'http response',
    'z': flowId,
    'name': '',
    'statusCode': '',
    'headers': {},
    'x': x + 400,
    'y': y,
    'wires': []
  }
  json.push(httpIn, template, httpResponse)
}
