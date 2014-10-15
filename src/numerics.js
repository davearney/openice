"use strict";

var OpenICE = require('./openice.js');
var PartitionBox = require('./partition-box.js');
var moment = require('moment');
var Renderer = require('./plot.js');

var DOMAINID = 15;
var tables = [];
var deviceName = {};
var renderers = [];

//var openICE = new OpenICE("http://dev.openice.info:80");
//openICE.maxSamples = 10000;


(function() { 
  var app = angular.module('diagnostics', []);

  app.filter('time_t', function() {
    return function(val) {
      if(typeof(val)=='undefined') {
        return undefined;
      }
      var sec = val.sec || val.seconds || 0;
      var nanosec = val.nanosec || val.nanoseconds || 0;
      if(sec == 0 && nanosec == 0) {
        return "N/A";
      } else {
        return moment(sec * 1000 + nanosec / 1000000).format("MM/DD/YY HH:mm:ss.SSS");
      }
    };
  });

  // app.factory('openice', function ($rootScope) {
  //   var openICE = new OpenICE("http://dev.openice.info:80");
  //   // console.log(openICE);
  //   return {
  //     on: function (eventName, callback) {
  //       openICE.on(eventName, function () {  
  //         var args = arguments;
  //         $rootScope.$apply(function () {
  //           callback.apply(openICE, eventName, args);
  //         });
  //       });
  //     },
  //     createTableAndRegister: function (a, eventName, callback) {

  //       var table = openICE.createTable(a);

  //       table.on('afteradd', function(e) {
  //         console.log(e);
  //       });

  //       for(var i = 0; i < eventName.length; i++) {
  //         var e = eventName[i];
  //         table.on(eventName[i], function() {

  //           var args = arguments;

  //           $rootScope.$apply(
  //             function () {
  //               if (callback) {
  //                 callback.apply(openICE, args);
  //               } else {
  //                 // console.log("No callback to apply");
  //               }
  //             }
  //           );
  //         });
  //       }
  //       return table;
  //     }
  //   };
  // });



  app.directive('openice', function() {
    return {
      restrict: 'E',
      scope: {
        url: '='
      },
      link: function(scope, element, attrs, controllers) {
        console.log("openice url="+attrs.url);
      }
    }

  })
  app.directive('myTable', function() {

    return {
      restrict: 'E',
      transclude: true,
      scope: {
        openice: '=',
        tableName: '@',
        domain: '@domain',
        partition: '=partition',
      },
      template: '<div ng-transclude></div>',
      link: function(scope, element, attrs, controllers) {
        //scope.table = scope.openice.createTableAndRegister({domain:scope.domain,partition:scope.partition,topic:scope.tableName}, ['sample','afterremove','afteradd'], function() {
          // scope.$apply();
        // });
        // console.log(attrs);
        // console.log(scope);
      }
    }
  });


  app.controller('DiagnosticController', ['$scope', '$http', function($scope, $http) {
    $scope.domain = DOMAINID;
    $scope.partition = [];
    $scope.multiIndex = function(obj,is) {  // obj,['1','2','3'] -> ((obj['1'])['2'])['3']
      return is.length ? this.multiIndex(obj[is[0]],is.slice(1)) : obj
    }
    $scope.pathIndex = function(obj,is) {   // obj,'1.2.3' -> multiIndex(obj,['1','2','3'])
      return this.multiIndex(obj,is.split('.'))
    }

    $scope.topics = [];
    $scope.deviceNames = {};
    //$scope.deviceTable = openice.createTableAndRegister({domain:15,'partition':[""],topic:'DeviceIdentity'}, ['sample','afterremove'], function(openICE, args) {
      //$scope.$apply();
    // });
    // Maintain a hash of device make/model by UDI
    // $scope.deviceTable.on('sample', function(e) {
    //   $scope.deviceNames[e.row.keyValues.unique_device_identifier] = e.sample.data.manufacturer + " " + e.sample.data.model;
    // });

    $http.get('data/topics.json')
       .success(function(data){
          $scope.topics = data;
        });
  }]);

})();

// function TableManager(tableName, keyFields, valueFields, valueHandler, keyHandler, description) {
//   this.table = null;
//   this.keyFields = keyFields;
//   this.valueFields = valueFields;
//   this.tableName = tableName;
//   this.valueHandler = valueHandler;
//   this.keyHandler = keyHandler;
//   this.description = description;
// }


// function trunc(udi) {
//   if(deviceName[udi]) {
//     return deviceName[udi];
//   } else {
//     return udi.substring(0,4);
//   }
// }

// TableManager.prototype.write = function(document) {
//   document.write("<a name=\""+this.tableName+"\"></a>");
//   document.write("<h2>"+this.tableName+"</h2><br/>");
//   document.write("<span class=\"description\">"+this.description+"</span>");
//   document.write("<table id=\""+this.tableName+"\"><tr>");
//   for(var i = 0; i < this.keyFields.length; i++) {
//     document.write("<td>"+this.keyFields[i]+"</td>");
//   }
//   document.write("<td>Timestamp</td>");
//   for(var i = 0; i < this.valueFields.length; i++) {
//     document.write("<td>"+this.valueFields[i]+"</td>");
//   }
//   document.write("</tr></table><br/>");
// }

// TableManager.prototype.changePartition = function(partition) {
//   if(this.table != null) {
//     this.openICE.destroyTable(this.table);
//     this.table = null;
//   }
//   this.table = this.openICE.createTable({domain: DOMAINID, 'partition': partition, topic:this.tableName});
//   var self = this;

//   this.table.on('sample', function(e) {
//     var openICE = e.openICE, table = e.table, row = e.row, sample = e.sample;
//     if(table.topic == 'DeviceIdentity') {
//       deviceName[row.keyValues.unique_device_identifier] = sample.data.manufacturer + " " + sample.data.model + " (" + row.keyValues.unique_device_identifier.substring(0,4)+")";
//     }
//     var tr = document.getElementById(self.tableName+row.rowId);
//     if(typeof tr === 'undefined' || tr == null) {
//       tr = document.createElement("tr");
//       tr.id = self.tableName+row.rowId;
//       tr.keyTds = [];
//       for(var i = 0; i < self.keyFields.length; i++) {
//         var td = document.createElement("td");
//         tr.keyTds.push(td);
//         tr.appendChild(td);  
//       }
//       self.keyHandler(tr.keyTds, row.keyValues);

//       var td = document.createElement("td");
//       tr.appendChild(td);
//       tr.timestamp = td;

//       tr.valueTds = [];
//       for(var i = 0; i < self.valueFields.length; i++) {
//         var td = document.createElement("td");
//         tr.valueTds.push(td);
//         tr.appendChild(td);
//       }

//       document.getElementById(self.tableName).appendChild(tr);
//     }
//     tr.timestamp.innerHTML = sample.sourceTimestamp;
//     self.valueHandler(tr.valueTds, sample.data, sample);
//   });
//   this.table.on('afterremove', function(e) {
//     var openICE = e.openICE, table = e.table, row = e.row;
//     if(table.topic == 'DeviceIdentity') {
//       delete deviceName[row.keyValues.unique_device_identifier];
//     }
//     if(row.renderer) {
//       var idx = renderers.indexOf(row.renderer);
//       renderers.splice(idx,1);
//       delete row.renderer;
//     }
//     var tr = document.getElementById(self.tableName+row.rowId);
//     if(typeof tr !== 'undefined' && tr != null) {
//       document.getElementById(self.tableName).removeChild(tr);
//     }
//   });
// }


// tables.push(new TableManager("SampleArray", 
//       ["UDI", "Metric", "Instance", "Frequency"], 
//       ["Values", "Device Time"],
//       function(tds, data, sample) { 
//         if(!sample.row.renderer) {
//           var canvas = document.createElement("canvas");
//           sample.row.canvas = canvas;

//           var touchdown = function(e) {
//             if (!e) var e = window.event;
//             if(!canvas.endTime) {
//               // Initialize the timeframe to a fixed value
//               var now = Date.now();
//               canvas.endTime = now - 4000;
//             } 
              
//             canvas.startTime = canvas.endTime - 5000;
//             canvas.startTimeString = moment(canvas.startTime).format('HH:mm:ss');
//             canvas.endTimeString = moment(canvas.endTime).format('HH:mm:ss');

//             canvas.downEndTime = canvas.endTime;
//             canvas.startX = e.touches ? e.touches[0].screenX : e.screenX;
//             canvas.msPerPixel = 5000 / canvas.width;
//             canvas.mouseDown = true;
//             e.cancelBubble = true;
//             e.returnValue = false;
//             if (e.stopPropagation) e.stopPropagation();
//             if (e.preventDefault) { e.preventDefault(); }
//             var touchmove = function(e) {
//               if (!e) var e = window.event;
//               if(canvas.mouseDown) {
//                 canvas.endTime = canvas.downEndTime - ((e.touches ? e.touches[0].screenX : e.screenX)-canvas.startX) * canvas.msPerPixel;
//                 canvas.startTime = canvas.endTime - 5000;
//                 canvas.startTimeString = moment(canvas.startTime).format('HH:mm:ss');
//                 canvas.endTimeString = moment(canvas.endTime).format('HH:mm:ss');

//                 e.cancelBubble = true;
//                 e.returnValue = false;
//                 if (e.stopPropagation) e.stopPropagation();
//                 if (e.preventDefault) { e.preventDefault(); }
//                 return false;
//               } else {
//                 return true;
//               }
//             };
//             var touchup = function(e) {
//               if (!e) var e = window.event;
//               canvas.mouseDown = false;
//               document.removeEventListener("mousemove", touchmove);
//               document.removeEventListener("mouseup", touchup);
//               document.removeEventListener("touchmove", touchmove);
//               document.removeEventListener("touchend", touchup);
//               document.removeEventListener("touchcancel", touchup);
              // var queryStart = new Date(canvas.startTime-10000);
              // var queryEnd = new Date((canvas.endTime+10000)>Date.now()?Date.now():canvas.endTime+10000);

              // var q = {"_id.key":sample.row.keyValues, 
              //          "_id.topic":sample.row.table.topic,
              //          "_id.partition":sample.row.table.partition,
              //          "_id.domain":sample.row.table.domain};

//               if(sample.row.samples.length==0) {
//                 q["_id.sourceTimestamp"] = {$gt: queryStart, $lt: queryEnd};
//                 sample.row.query(q);
//               } else {
//                 if (queryStart < sample.row.samples[0].sourceTimestamp) {
//                   q["_id.sourceTimestamp"] = {$gt: queryStart, $lt: sample.row.samples[0].sourceTimestamp};
//                   sample.row.query(q);
//                 }
//                 if(queryEnd > sample.row.latest_sample.sourceTimestamp) {
//                   q["_id.sourceTimestamp"] = {$gt: sample.row.latest_sample.sourceTimestamp, $lt: queryEnd};
//                   sample.row.query(q); 
//                 }
//               }
              
//             };
//             document.addEventListener("mousemove", touchmove);
//             document.addEventListener("mouseup", touchup);
//             document.addEventListener("touchmove", touchmove);
//             document.addEventListener("touchend", touchup);
//             document.addEventListener("touchcancel", touchup);
            

//             return false;
//           };
//           canvas.addEventListener("mousedown", touchdown);
//           canvas.addEventListener("touchstart", touchdown);

//           tds[0].appendChild(sample.row.canvas);
//           sample.row.renderer = new Renderer({'canvas':sample.row.canvas, 'row':sample.row, overwrite: false});
//           renderers.push(sample.row.renderer);
//         }
//         // sample.row.renderer.render(t1, t2);
//         tds[1].innerHTML = data.device_time; },
//       function(tds, keys) { tds[0].innerHTML = trunc(keys.unique_device_identifier);
//         tds[1].innerHTML = keys.metric_id; tds[2].innerHTML = keys.instance_id;
//         tds[3].innerHTML = keys.frequency; },
//       "SampleArrays are values observed by sensors at a relatively high rate; generally >1Hz.  Multiple sensors may exist for the same metric so the instance_id serves to distinguish between them.  If a timestamp is available from the device's internal clock it is specified as device_time.  A device ought to register an instance of SampleArray when the associated sensor might provide observations.  If the sensor is physically disconnected or otherwise certain not to provide samples then the associated instance should be unregistered.  Sourcetimestamp and device_time should both represent the point in time at the end of the sample array."
//       ));


// window.addEventListener('load', function() {
//   var select = document.getElementById('partitionBox');
//   //var wsHost = window.location.protocol == 'file:' ? 'http://dev.openice.info' : window.location.protocol + '//' + window.location.host;

//   for(var i = 0; i < this.tables.length; i++) {
//     tables[i].openICE = openICE;
//   }

//   // openICE.on('open', function(e) {
//   //   $('.status').html('Connected').css('color', 'green');
//   // });
//   // openICE.on('close', function(e) {
//   //   $('.status').html('Disconnected').css('color', 'red');
//   // });

//   var changePartition = function(partition) {
//     for(var i = 0; i < tables.length; i++) {
//       tables[i].changePartition(partition);
//     }
//   };
//   PartitionBox(openICE, select, DOMAINID, changePartition);

//   function renderFunction() {
//     if(renderers.length > 0) {


//       var now = Date.now();
//       var t2 = now - 4000;
//       var t1 = t2 - 5000;
//       // var oldest = renderers[0];
//       var s1 = moment(t1).format('HH:mm:ss');
//       var s2 = moment(t2).format('HH:mm:ss');


//       // if(oldest.lastRender) {
//         for(var i = 0; i < renderers.length; i++) {
//           var canvas = renderers[i].canvas;
//           if(canvas.startTime && canvas.endTime) {
//             renderers[i].render(canvas.startTime, canvas.endTime, canvas.startTimeString, canvas.endTimeString);
//           } else {
//             renderers[i].render(t1, t2, s1, s2);
//           }
//           // if(!renderers[i].lastRender) {
//             // oldest = renderers[i];
//             // break;
//           // } else if(renderers[i].lastRender < oldest.lastRender) {
//             // oldest = renderers[i];
//           // }
//           // renderers[i].render(t1, t2, s1, s2);
//         }
//       // }
//       // oldest.render(t1, t2);
//       // oldest.lastRender = now;

//     } 
    
//     setTimeout(renderFunction, 75);
//   };
//   setTimeout(renderFunction, 75);

//   select.focus();
// });

// window.tables = tables;
