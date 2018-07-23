'use strict'
var dateformat = require('dateformat')
exports.now = function () {
  return dateformat(new Date(), 'yyyy-mm-dd HH:MM:ss')
}
