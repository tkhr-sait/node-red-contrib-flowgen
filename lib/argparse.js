'use strict'
var version = '0.1.3'
exports.parseArguments = function (argv) {
  var ArgumentParser = require('argparse').ArgumentParser
  var parser = new ArgumentParser({
    version: version,
    addHelp: true,
    description: 'flow generator for Node-RED'
  })
  parser.addArgument(
    [ '-i', '--input' ],
    {
      help: 'swagger.json input',
      required: true
    }
  )
  parser.addArgument(
    [ '-o', '--output' ],
    {
      help: 'flows.json output',
      required: true
    }
  )
  parser.addArgument(
    [ '-f', '--flowName' ],
    {
      help: 'flowName default: Swagger API',
      defaultValue: 'Swagger API'
    }
  )
  parser.addArgument(
    [ '-m', '--merge' ],
    {
      help: 'merge mode',
      action: 'storeTrue'
    }
  )
  parser.addArgument(
    [ '-V', '--validate' ],
    {
      help: 'with validation',
      action: 'storeTrue'
    }
  )
  parser.addArgument(
    [ '-s', '--swaggerDocOutput' ],
    {
      help: 'create node-red-node-swagger node',
      action: 'storeTrue'
    }
  )
  var arg = parser.parseArgs()
  return arg
}
