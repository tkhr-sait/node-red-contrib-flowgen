#!/usr/bin/env node
'use strict'

var fs = require('fs')
var SwaggerParser = require('swagger-parser')
var argparse = require('./lib/argparse.js')
var flowGenerator = require('./lib/flow-generator.js')
var nodeRed = require('./lib/node-red.js')

var arg = argparse.parseArguments(process.argv)
var input = arg.input
var output = arg.output
var flowName = arg.flowName
var merge = arg.merge
var validate = arg.validate
var swaggerDocOutput = arg.swaggerDocOutput

// validation
if (validate) {
  var promise = new Promise(function (resolve, reject) {
    SwaggerParser.validate(input)
      .then(function (api) {
        console.log('validation ok')
        resolve()
      })
      .catch(function (err) {
        console.error(err)
        process.exit(2)
      })
  })
  Promise.all([promise])
}

// defult x,y
var x = 400
var y = 100
var xIncrement = 200
var yIncrement = 100

// merge output
var json = []
var flowId = null
if (merge === true) {
  try {
    json = JSON.parse(fs.readFileSync(output))
  } catch (err) {
    console.error(err)
    process.exit(2)
  }
  // search flow & getId(validate...)
  for (var idx in json) {
    if (json[idx].type === 'tab' && json[idx].label === flowName) {
      flowId = json[idx].id
      break
    }
  }
}
if (flowId === null) {
  // create new flow
  var flow = nodeRed.createFlowNode(flowName)
  json.push(flow)
  flowId = flow.id
}

// calc max y position & collect api
var apis = []
if (merge === true) {
  y = flowGenerator.calcMaxY(json, flowId, y)
  apis = flowGenerator.collectApis(json, flowId)
}

// read from swagger.json
SwaggerParser.dereference(input)
  .then(function (api) {
    json = flowGenerator.generate(json, flowId, api, merge, apis, swaggerDocOutput, x, y, xIncrement, yIncrement)
    // output
    var jsonstr = JSON.stringify(json, null, 4)
    try {
      fs.writeFileSync(output, jsonstr)
    } catch (err) {
      console.error(err)
      process.exit(2)
    }
    console.log('generate flow success.')
    process.exit(0)
  })
  .catch(function (err) {
    console.error(err)
    process.exit(2)
  })
