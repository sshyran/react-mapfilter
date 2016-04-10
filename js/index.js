'use strict'

// globally self-installing deps
require('./lib/locale.js')
require('./lib/leaflet-0.7.1.js')
require('./lib/bing_layer.js')
require('./lib/leaflet_providers.js')
require('./lib/d3.v4.js')
require('./lib/d3-dates.v4.js')

var $ = window.jQuery = require('jquery')
require('bootstrap')

// app
window.locale.en = require('../locale/en')
window.locale.fr = require('../locale/fr')
window.locale.es = require('../locale/es')
window.locale.init()

var mapFilter = require('./mapfilter/mapfilter.js')
var config = new (require('./config.js'))
var defaults = require('../defaults.json')

var ipc = require('electron').ipcRenderer
config.listenTo(config, 'import-filter', function () {
  ipc.send('import-filter')
})

var fs = require('fs')
var path = require('path')

ipc.on('select-filter', function (ev, file) {
  fs.readFile(file, function (err, src) {
    if (err) return config.trigger('error', err)
    try { var doc = JSON.parse(src) }
    catch (err) { return config.trigger('error', err) }

    sync.meta.put('filter/' + path.basename(file), doc, function (err) {
      if (err) config.trigger('error', err)
      else config.load()
    })
  })
})

var hash = window.location.hash
if (hash === '') {
  // default to sample data
  hash = '#id=github:spacedogxyz/sample-monitoring-data/' +
         '&map=10/2.6362/-59.4801'
}

var sync = require('./sync.js')
var dragDrop = require('drag-drop')
dragDrop(window, function (files) {
  sync.importFiles(files, function (err, docs) {
    if (err) return error(err)
    console.log('imported ' + docs.length + ' reports')
  })
})

window.app = mapFilter({
  // parse hash to get config details
  config: config.parse(hash, defaults),

  // app container
  el: $('#app')
})
