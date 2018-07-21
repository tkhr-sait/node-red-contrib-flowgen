#!/usr/bin/env node
'use strict'

var fs = require('fs')
var SwaggerParser = require('swagger-parser')
var argparse = require('./lib/argparse.js')
var nodeRed = require('./lib/node-red.js')
var dateformat = require('dateformat')

var arg = argparse.parseArguments(process.argv)
var input = arg.input
var output = arg.output
var flowName = arg.flowName
var merge = arg.merge
var validate = arg.validate
var swaggerDocOutput = arg.swaggerDocOutput

// defult x,y
var x = 400
var y = 100

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
  for (var index in json) {
    if (json[index].z === flowId) {
      if (json[index].y >= y) {
        y = json[index].y + 50
      }
      if (nodeRed.isHttpInNode(flowId, json[index])) {
        apis.push(json[index].url + ',' + json[index].method)
      }
    }
  }
}

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

// read from swagger.json
SwaggerParser.dereference(input)
  .then(function (api) {
    // create nodes
    var deleteTargetNodeIds = []
    for (var path in api.paths) {
      for (var pathMethod in api.paths[path]) {
        var specs = api.paths[path][pathMethod]
        var convertedUrl = nodeRed.convertUrl(api.basePath, path)
        // get example
        var functionString = nodeRed.createfunctionString(specs)
        var swaggerDocNode = ''
        var swaggerDocNodeId = ''
        var hit = false
        if (merge === true) {
          // search url+method in 'http in' nodes
          for (var idx in json) {
            if (nodeRed.isHttpInNode(flowId, json[idx]) &&
                json[idx].url === convertedUrl &&
                json[idx].method === pathMethod) {
              hit = true
              // check modify
              var prevSpecs = ''
              if (json[idx].outputLabels !== undefined) {
                prevSpecs = json[idx].outputLabels[0]
              }
              if (prevSpecs !== JSON.stringify(specs)) {
                // add modified comment
                console.log('modified(' + dateformat(new Date(), 'yyyy-mm-dd HH:MM:ss') + '). [' + json[idx].method + ']' + json[idx].url)
                for (var idx2 in json) {
                  if (json[idx2].z === flowId &&
                      json[idx2].type === 'comment' &&
                      json[idx2].x === (x - 100) &&
                      json[idx2].y === (json[idx].y - 25)) {
                    deleteTargetNodeIds.push(json[idx2].id)
                    break
                  }
                }
                json.push(nodeRed.createComment(flowId, 'modified(' + dateformat(new Date(), 'yyyy-mm-dd HH:MM:ss') + '). [' + json[idx].method + ']' + json[idx].url, '', x - 100, json[idx].y - 25))
                json[idx].outputLabels = [JSON.stringify(specs)]
                if (swaggerDocOutput) {
                  swaggerDocNode = nodeRed.createSwaggerDocNode(specs)
                  swaggerDocNodeId = swaggerDocNode.id
                  json.push(swaggerDocNode)
                  // delete original swaggerDoc
                  if (json[idx].swaggerDoc !== undefined ||
                      json[idx].swaggerDoc !== '') {
                    deleteTargetNodeIds.push(json[idx].swaggerDoc)
                  }
                  json[idx].swaggerDoc = swaggerDocNodeId
                }
                if (json[idx].wires !== undefined) {
                  for (var idx3 in json) {
                    if (json[idx3].z === flowId &&
                        json[idx3].type === 'function' &&
                        json[idx3].id === json[idx].wires[0][0]) {
                      json[idx3].func = functionString
                      break
                    }
                  }
                }
              }

              // remove from apis
              apis = apis.filter(function (value) {
                return value !== (json[idx].url + ',' + json[idx].method)
              })
              break
            }
          }
        }
        if (hit === false) {
          // add new api comment
          console.log('added(' + dateformat(new Date(), 'yyyy-mm-dd HH:MM:ss') + '). [' + pathMethod + '] ' + convertedUrl)
          json.push(nodeRed.createComment(flowId, 'added(' + dateformat(new Date(), 'yyyy-mm-dd HH:MM:ss') + '). [' + pathMethod + '] ' + convertedUrl, '', x - 100, y - 25))
          if (swaggerDocOutput) {
            swaggerDocNode = nodeRed.createSwaggerDocNode(specs)
            json.push(swaggerDocNode)
            swaggerDocNodeId = swaggerDocNode.id
          }
          var httpInNode = nodeRed.createHttpNode(flowId, swaggerDocNodeId, convertedUrl, pathMethod, JSON.stringify(specs), x, y)
          var functionNode = nodeRed.createFunctionNode(flowId, functionString, x + 200, y)
          var responseNode = nodeRed.createResponseNode(flowId, x + 400, y)
          httpInNode.wires = [ [functionNode.id] ]
          functionNode.wires = [ [responseNode.id] ]
          json.push(httpInNode, functionNode, responseNode)
          y += 100
        }
      }
    }
    // check deleted api
    if (merge === true) {
      for (var index in json) {
        if (nodeRed.isHttpInNode(flowId, json[index])) {
          for (var deletedApi in apis) {
            if (apis[deletedApi] === json[index].url + ',' + json[index].method) {
              // add deleted api comment
              console.log('deleted(' + dateformat(new Date(), 'yyyy-mm-dd HH:MM:ss') + '). [' + json[index].method + '] ' + json[index].url)
              json.push(nodeRed.createComment(flowId, 'deleted(' + dateformat(new Date(), 'yyyy-mm-dd HH:MM:ss') + '). [' + json[index].method + '] ' + json[index].url, '', x - 100, json[index].y - 25))
              break
            }
          }
        }
      }
    }
    // remove from json
    json = json.filter(function (value) {
      for (var deleteTargetNodeId in deleteTargetNodeIds) {
        if (value.id === deleteTargetNodeIds[deleteTargetNodeId]) {
          return false
        }
      }
      return true
    })
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
