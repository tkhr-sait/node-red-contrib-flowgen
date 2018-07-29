'use strict'
var RED = require('node-red')
// functions -------------------------------------------------------------------
exports.isNode = function (flowId, type, node) {
  if (node.z === flowId &&
      node.type === type) {
    return true
  }
  return false
}
exports.createFlowNode = function (flowName) {
  var flowId = RED.util.generateId()
  var json = {
    'id': flowId,
    'type': 'tab',
    'label': flowName,
    'disabled': false,
    'info': ''
  }
  return json
}
exports.createCommentNode = function (flowId, title, detail, x, y) {
  var commentId = RED.util.generateId()
  var json = {
    'id': commentId,
    'type': 'comment',
    'z': flowId,
    'name': title,
    'info': detail,
    'x': x,
    'y': y,
    'wires': []
  }
  return json
}
exports.createHttpInNode = function (flowId, swaggerDocNodeId, url, method, outputLabel, x, y) {
  // create http nodes
  var httpInNodeId = RED.util.generateId()
  var json = {
    'id': httpInNodeId,
    'type': 'http in',
    'z': flowId,
    'name': '',
    'url': url,
    'method': method,
    'upload': false,
    'outputLabels': [outputLabel],
    'x': x,
    'y': y,
    'wires': []
  }
  if (swaggerDocNodeId !== '') {
    json.swaggerDoc = swaggerDocNodeId
  }
  return json
}
exports.createFunctionNode = function (flowId, functionString, x, y) {
  var functionNodeId = RED.util.generateId()
  var json = {
    'id': functionNodeId,
    'type': 'function',
    'z': flowId,
    'name': 'example',
    'func': functionString,
    'outputs': 1,
    'noerr': 0,
    'x': x,
    'y': y,
    'wires': []
  }
  return json
}
exports.createHttpResponseNode = function (flowId, x, y) {
  var httpResponseNodeId = RED.util.generateId()
  var json = {
    'id': httpResponseNodeId,
    'type': 'http response',
    'z': flowId,
    'name': '',
    'statusCode': '',
    'headers': {'Access-Control-Arrow-Origin': '* '},
    'x': x,
    'y': y,
    'wires': []
  }
  return json
}
exports.createSwaggerDocNode = function (specs) {
  var swaggerDocId = RED.util.generateId()

  var parameters = []
  var responses = {}
  if (specs.parameters !== undefined) {
    for (var parameterKey in specs.parameters) {
      if (specs.parameters[parameterKey].type !== undefined) {
        if (specs.parameters[parameterKey].type === 'string' ||
            specs.parameters[parameterKey].type === 'integer' ||
            specs.parameters[parameterKey].type === 'number' ||
            specs.parameters[parameterKey].type === 'boolean') {
          var parameter = {name: '', in: '', description: '', required: false, type: '', format: ''}

          parameter.type = specs.parameters[parameterKey].type
          parameter.name = exports.convertString(specs.parameters[parameterKey].name)
          parameter.in = exports.convertString(specs.parameters[parameterKey].in)
          parameter.description = exports.convertString(specs.parameters[parameterKey].description)
          parameter.required = exports.convertBoolean(specs.parameters[parameterKey].required)
          parameter.format = exports.convertString(specs.parameters[parameterKey].format)
          parameters.push(parameter)
        }
      }
    }
  }
  if (specs.responses !== undefined) {
    for (var responseCode in specs.responses) {
      var response = {description: ''}
      response.description = exports.convertString(specs.responses[responseCode].description)
      responses[responseCode] = response
    }
  }
  var json = {
    'id': swaggerDocId,
    'type': 'swagger-doc',
    'z': '',
    'summary': exports.convertString(specs.summary),
    'description': exports.convertString(specs.description),
    'tags': exports.convertCsv(specs.tags),
    'consumes': exports.convertCsv(specs.consumes),
    'produces': exports.convertCsv(specs.produces),
    'parameters': parameters,
    'responses': responses,
    'deprecated': exports.convertBoolean(specs.deprecated)
  }
  return json
}
exports.convertUrl = function (basePath, path) {
  return (exports.convertString(basePath) + path).replace(/\{([^}]*)\}/g, ':$1')
}
exports.convertBoolean = function (str) {
  if (str === undefined) {
    return false
  } else if (str === 'true') {
    return true
  }
  return false
}
exports.convertString = function (str) {
  if (str === undefined) {
    return ''
  }
  return str
}
exports.convertCsv = function (array) {
  if (array === undefined) {
    return ''
  }
  return array.toString()
}
exports.createFunctionString = function (endpoint) {
  var ret = ''
  var response = { headers: '', body: '', statusCode: '' }
  // header etc
  for (var statusCode in endpoint.responses) {
    response.statusCode = statusCode
    if (response.statusCode === 'default') {
      response.statusCode = 200
    }
    if (endpoint.responses[statusCode].headers !== undefined) {
      var headers = []
      for (var header in endpoint.responses[statusCode].headers) {
        if (endpoint.responses[statusCode].headers[header].example !== undefined) {
          var head = {}
          head[header] = endpoint.responses[statusCode].headers[header].example
          headers.push(head)
        }
      }
      response.headers = JSON.stringify(headers)
    }
    if (endpoint.responses[statusCode].examples !== undefined) {
      for (var example in endpoint.responses[statusCode].examples) {
        ret = endpoint.responses[statusCode].examples[example]
        break
      }
    } else if (endpoint.responses[statusCode].schema !== undefined) {
      ret = getExampleValue(endpoint.responses[statusCode].schema)
    }
    break
  }
  if (ret !== '') {
    response.body = JSON.stringify(ret)
  }
  ret = ''
  if (response.statusCode !== '') {
    ret += 'msg.statusCode = ' + response.statusCode + ';\n'
  }
  if (response.headers !== '') {
    ret += 'msg.headers = ' + response.headers + ';\n'
  } else {
    ret += 'msg.headers = \'\';\n'
  }
  if (response.body !== '') {
    ret += 'msg.payload = ' + response.body + ';\n'
  } else {
    ret += 'msg.payload = \'\';\n'
  }
  ret += 'return msg;\n'
  return ret
}
function getExampleValue (value) {
  var ret = ''
  var example
  if (value.type === 'object') {
    for (var property in value.properties) {
      example = getExampleValue(value.properties[property])
      if (ret === '') {
        ret = {}
      }
      ret[property] = example
    }
  } else if (value.type === 'array') {
    if (value.example !== undefined) {
      ret = value.example
    } else {
      example = getExampleValue(value.items)
      ret = []
      ret.push(example)
    }
  } else {
    ret = exports.convertString(value.example)
  }
  return ret
}
exports.removeNodes = function (json, deleteTargetNodeIds) {
  json = json.filter(function (value) {
    for (var deleteTargetNodeId in deleteTargetNodeIds) {
      if (value.id === deleteTargetNodeIds[deleteTargetNodeId]) {
        return false
      }
    }
    return true
  })
  return json
}
