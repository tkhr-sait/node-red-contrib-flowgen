'use strict'
var nodeRed = require('./node-red.js')
var util = require('./utils.js')
exports.calcMaxY = function (json, flowId, y) {
  for (var index in json) {
    if (json[index].z === flowId) {
      if (json[index].y >= y) {
        y = json[index].y + 50
      }
    }
  }
  return y
}

exports.collectApis = function (json, flowId) {
  var apis = []
  for (var index in json) {
    if (json[index].z === flowId) {
      if (nodeRed.isNode(flowId, 'http in', json[index])) {
        apis.push(json[index].url + ',' + json[index].method)
      }
    }
  }
  return apis
}

exports.generate = function (json, flowId, api, merge, apis, swaggerDocOutput, x, y, xIncrement, yIncrement) {
  // create nodes
  var deleteTargetNodeIds = []
  for (var path in api.paths) {
    for (var pathMethod in api.paths[path]) {
      var specs = api.paths[path][pathMethod]
      var convertedUrl = nodeRed.convertUrl(api.basePath, path)
      var swaggerDocNode = ''
      var swaggerDocNodeId = ''
      var hit = false
      if (merge === true) {
        // search url+method in 'http in' nodes
        for (var idx in json) {
          if (nodeRed.isNode(flowId, 'http in', json[idx]) &&
              json[idx].url === convertedUrl &&
              json[idx].method === pathMethod) {
            hit = true
            // check modified
            var prevSpecs = ''
            if (json[idx].outputLabels !== undefined) {
              prevSpecs = json[idx].outputLabels[0]
            }
            if (prevSpecs !== JSON.stringify(specs)) {
              // add modified comment
              for (var idx2 in json) {
                if (nodeRed.isNode(flowId, 'comment', json[idx2]) &&
                    json[idx2].x === (x - 100) &&
                    json[idx2].y === (json[idx].y - 25)) {
                  deleteTargetNodeIds.push(json[idx2].id)
                  break
                }
              }
              console.log('modified(' + util.now() + '). [' + json[idx].method + ']' + json[idx].url)
              json.push(nodeRed.createCommentNode(flowId, 'modified(' + util.now() + '). [' + json[idx].method + ']' + json[idx].url, '', x - 100, json[idx].y - 25))
              json[idx].outputLabels = [JSON.stringify(specs)]
              // update swaggerDoc
              if (swaggerDocOutput) {
                swaggerDocNode = nodeRed.createSwaggerDocNode(specs)
                swaggerDocNodeId = swaggerDocNode.id
                json.push(swaggerDocNode)
                // delete original swaggerDoc
                if (json[idx].swaggerDoc !== undefined &&
                    json[idx].swaggerDoc !== '') {
                  deleteTargetNodeIds.push(json[idx].swaggerDoc)
                }
                json[idx].swaggerDoc = swaggerDocNodeId
              }
              // update example function
              if (json[idx].wires !== undefined) {
                for (var idx3 in json) {
                  if (nodeRed.isNode(flowId, 'function', json[idx3]) &&
                      json[idx3].name === 'example' &&
                      json[idx3].id === json[idx].wires[0][0]) {
                    json[idx3].func = nodeRed.createFunctionString(specs)
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
        console.log('added(' + util.now() + '). [' + pathMethod + '] ' + convertedUrl)
        json.push(nodeRed.createCommentNode(flowId, 'added(' + util.now() + '). [' + pathMethod + '] ' + convertedUrl, '', x - 100, y - 25))
        if (swaggerDocOutput) {
          swaggerDocNode = nodeRed.createSwaggerDocNode(specs)
          json.push(swaggerDocNode)
          swaggerDocNodeId = swaggerDocNode.id
        }
        var httpInNode = nodeRed.createHttpInNode(flowId, swaggerDocNodeId, convertedUrl, pathMethod, JSON.stringify(specs), x, y)
        var functionNode = nodeRed.createFunctionNode(flowId, nodeRed.createFunctionString(specs), x + xIncrement, y)
        var httpResponseNode = nodeRed.createHttpResponseNode(flowId, x + (xIncrement * 2), y)
        httpInNode.wires = [ [functionNode.id] ]
        functionNode.wires = [ [httpResponseNode.id] ]
        json.push(httpInNode, functionNode, httpResponseNode)
        y += yIncrement
      }
    }
  }
  // check deleted api
  if (merge === true) {
    for (var index in json) {
      if (nodeRed.isNode(flowId, 'http in', json[index])) {
        for (var deletedApi in apis) {
          if (apis[deletedApi] === json[index].url + ',' + json[index].method) {
            // add deleted api comment
            console.log('deleted(' + util.now() + '). [' + json[index].method + '] ' + json[index].url)
            json.push(nodeRed.createCommentNode(flowId, 'deleted(' + util.now() + '). [' + json[index].method + '] ' + json[index].url, '', x - 100, json[index].y - 25))
            break
          }
        }
      }
    }
  }
  // remove from json
  json = nodeRed.removeNodes(json, deleteTargetNodeIds)
  return json
}
