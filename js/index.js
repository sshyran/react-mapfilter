'use strict';

// globally self-installing deps
require('./lib/locale.js')
require('./lib/leaflet-0.7.1.js')
require('./lib/bing_layer.js')
require('./lib/leaflet_providers.js')

// app
require('../data/locale.js')
var mapFilter = require('./mapfilter/mapfilter.js')

var app = window.app = mapFilter({
  // target for github database
  url: 'https://github.com/digidem/wapichanao-data/tree/master/submissions/monitoring.geojson',

  // app container
  el: $("#app"),

  // An array of filters to explore the data.
  // `field` is the field/attribute to filter by
  // `type` should be `discrete` for string data and `continuous` for numbers or dates
  // `expanded` sets whether the filter view is expanded or collapsed by default
  filters: [{
    type: "continuous",
    field: "today",
    expanded: true
  }, {
    type: "discrete",
    field: "happening",
    expanded: true
  }, {
    type: "discrete",
    field: "people",
    expanded: true
  }],

  githubToken: (function() {
    var token = document.cookie.replace(/(?:(?:^|.*;\s*)githubToken\s*\=\s*([^;]*).*$)|^.*$/, "$1");
    if (token) return token
    token = window.prompt('Please enter Github token');
    var cookie = 'githubToken=' + token + ';max-age=2592000'
    if (window.location.protocol === 'https:') cookie += ';secure'
    document.cookie = cookie
    return token
  })(),

  // Template to generate maptile urls. See http://leafletjs.com/reference.html#url-template
  tileUrl: 'http://{s}.tiles.mapbox.com/v3/gmaclennan.wapichana_background/{z}/{x}/{y}.jpg',
  // tileUrl: 'http://localhost:20008/tile/wapichana_background/{z}/{x}/{y}.png',

  // API key for Bing Maps use
  bingKey: "AtCQswcYKiBKRMM8MHjAzncJvN6miHjgxbi2-m1oaFUHMa06gszNwt4Xe_te18FF"
})