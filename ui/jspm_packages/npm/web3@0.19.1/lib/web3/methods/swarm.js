/* */ 
"use strict";
var Method = require('../method');
var Property = require('../property');
function Swarm(web3) {
  this._requestManager = web3._requestManager;
  var self = this;
  methods().forEach(function(method) {
    method.attachToObject(self);
    method.setRequestManager(self._requestManager);
  });
  properties().forEach(function(p) {
    p.attachToObject(self);
    p.setRequestManager(self._requestManager);
  });
}
var methods = function() {
  var blockNetworkRead = new Method({
    name: 'blockNetworkRead',
    call: 'bzz_blockNetworkRead',
    params: 1,
    inputFormatter: [null]
  });
  var syncEnabled = new Method({
    name: 'syncEnabled',
    call: 'bzz_syncEnabled',
    params: 1,
    inputFormatter: [null]
  });
  var swapEnabled = new Method({
    name: 'swapEnabled',
    call: 'bzz_swapEnabled',
    params: 1,
    inputFormatter: [null]
  });
  var download = new Method({
    name: 'download',
    call: 'bzz_download',
    params: 2,
    inputFormatter: [null, null]
  });
  var upload = new Method({
    name: 'upload',
    call: 'bzz_upload',
    params: 2,
    inputFormatter: [null, null]
  });
  var retrieve = new Method({
    name: 'retrieve',
    call: 'bzz_retrieve',
    params: 1,
    inputFormatter: [null]
  });
  var store = new Method({
    name: 'store',
    call: 'bzz_store',
    params: 2,
    inputFormatter: [null, null]
  });
  var get = new Method({
    name: 'get',
    call: 'bzz_get',
    params: 1,
    inputFormatter: [null]
  });
  var put = new Method({
    name: 'put',
    call: 'bzz_put',
    params: 2,
    inputFormatter: [null, null]
  });
  var modify = new Method({
    name: 'modify',
    call: 'bzz_modify',
    params: 4,
    inputFormatter: [null, null, null, null]
  });
  return [blockNetworkRead, syncEnabled, swapEnabled, download, upload, retrieve, store, get, put, modify];
};
var properties = function() {
  return [new Property({
    name: 'hive',
    getter: 'bzz_hive'
  }), new Property({
    name: 'info',
    getter: 'bzz_info'
  })];
};
module.exports = Swarm;
