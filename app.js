///////////////////////////////////////////////////////////////////////////////
// @file         : app.js                                                    //
// @summary      : API Runner                                                //
// @version      : 0.1                                                       //
// @project      : Apicatus                                                  //
// @description  : API Test Runner                                           //
// @author       : Benjamin Maggi                                            //
// @email        : benjaminmaggi@gmail.com                                   //
// @date         : 17 Nov 2014                                               //
// ------------------------------------------------------------------------- //
//                                                                           //
// Copyright 2013~2014 Benjamin Maggi <benjaminmaggi@gmail.com>              //
//                                                                           //
//                                                                           //
// License:                                                                  //
// Permission is hereby granted, free of charge, to any person obtaining a   //
// copy of this software and associated documentation files                  //
// (the "Software"), to deal in the Software without restriction, including  //
// without limitation the rights to use, copy, modify, merge, publish,       //
// distribute, sublicense, and/or sell copies of the Software, and to permit //
// persons to whom the Software is furnished to do so, subject to the        //
// following conditions:                                                     //
//                                                                           //
// The above copyright notice and this permission notice shall be included   //
// in all copies or substantial portions of the Software.                    //
//                                                                           //
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS   //
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF                //
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.    //
// IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY      //
// CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,      //
// TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE         //
// SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.                    //
//                                                                           //
///////////////////////////////////////////////////////////////////////////////


var config = require('./config'),
    mongoose = require('mongoose'),
    express = require('express'),
    router = express.Router(),
    bodyParser = require('body-parser'),
    cookieParser = require('cookie-parser'),
    path = require('path'),
    http = require('http'),
    https = require('https'),
    async = require('async');

// Globals
var app = express();
var router = express.Router();
var DB = null;

// Routes
var index = require('./routes/index');
var queue = require('./routes/queue');


var list = [{
    name: "benjamin",
    id: 1
}, {
    name: "anna",
    id: 1
}, {
    name: "Steve",
    id: 1
}, {
    name: "Julian",
    id: 1
}, {
    name: "Tomas",
    id: 1
}, {
    name: "Bill",
    id: 1
}];
var runners = function() {

    return async.forever(
        function(next) {
            // next is suitable for passing to things that need a callback(err [, whatever]);
            // it will result in this function being called again.

            async.mapLimit(list, 1, function(item, callback) {
                setTimeout(function(){
                    item.id += 1;
                    callback(null, item);
                }, 2000)
            }, function(error, callback) {
                next();
            });
        },
        function(error) {
            // if next is called with a value in its first parameter, it will appear
            // in here as 'error', and execution will stop.
        }
    );
};

////////////////////////////////////////////////////////////////////////////////
// Mongo URL generator                                                        //
////////////////////////////////////////////////////////////////////////////////
var generateMongoUrl = function(conf) {
    'use strict';

    if(conf.username && conf.password) {
        return 'mongodb://' + conf.username + ':' + conf.password + '@' + conf.hostname + ':' + conf.port + '/' + conf.db;
    }
    else{
        return 'mongodb://' + conf.hostname + ':' + conf.port + '/' + conf.db;
    }
};

////////////////////////////////////////////////////////////////////////////////
// Aplication setup database and http & sockets                               //
////////////////////////////////////////////////////////////////////////////////
var init = function() {
    'use strict';

    var mongoUrl = null;
    var server = null;

    mongoUrl = generateMongoUrl(config.mongoUrl);
    ///////////////////////////////////////////////////////////////////////////////
    // Connect mongoose                                                          //
    ///////////////////////////////////////////////////////////////////////////////
    DB = mongoose.connect(mongoUrl);
    ///////////////////////////////////////////////////////////////////////////////
    // Connect to elasticsearch                                                  //
    ///////////////////////////////////////////////////////////////////////////////
    var server = app.listen(process.env.VCAP_APP_PORT || 3000, function () {

      var host = server.address().address;
      var port = server.address().port;

      console.log('Runner app listening at http://%s:%s', host, port);
      runners();

    });
    return server;
};


////////////////////////////////////////////////////////////////////////////////
// Mongoose event listeners                                                   //
////////////////////////////////////////////////////////////////////////////////
mongoose.connection.on('open', function() {
    'use strict';
    console.log('mongodb connected');
});
mongoose.connection.on('error', function(error) {
    'use strict';
    console.log('mongodb connection error: %s', error);
});
// When the connection is disconnected
mongoose.connection.on('disconnected', function () {
    'use strict';
    console.log('Mongoose default connection disconnected');
});


///////////////////////////////////////////////////////////////////////////////
// CORS middleware (only to test on cloud9)                                  //
///////////////////////////////////////////////////////////////////////////////
var allowCrossDomain = function(request, response, next) {
    'use strict';

    response.header('Access-Control-Allow-Origin', '*');
    response.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Authorization, Accept, token');
    response.header('Access-Control-Allow-Methods', 'OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT');

    // intercept OPTIONS method
    if ('OPTIONS' === request.method) {
        response.status(200).end();
    }
    else {
        next();
    }
};

///////////////////////////////////////////////////////////////////////////////
// Configuration                                                             //
///////////////////////////////////////////////////////////////////////////////
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.set('title', 'Runner');
// Body Parser
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());
// Cookie Parser
app.use(cookieParser());
// Allow CORS
app.use(allowCrossDomain);
// Static files
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);
app.use('/queue', queue);


/*
app.get('/queue', function(request, response, next){
    response.statusCode = 200;
    response.json(list);
});
app.post('/queue', function(request, response, next){
    list.push({
        name: request.body.name,
        id: parseInt(request.body.id, 10)
    });
});
*/

switch(process.env.NODE_ENV) {
    case 'development':
        app.use(errorhandler({ dumpExceptions: true, showStack: true }));
        //app.use(express.logger());
    break;
    case 'test':
        app.use(errorhandler());
    break;
    case 'production':
        app.use(errorhandler());
    break;
}

exports.app = init();

///////////////////////////////////////////////////////////////////////////////
// Gracefully Shuts down the workers.
///////////////////////////////////////////////////////////////////////////////
process
    .on('SIGTERM', function () {
        'use strict';

        console.log('SIGTERM');
        exports.app.close(function () {
            console.log("express terminated");
            mongoose.connection.close(function () {
                console.log("mongodb terminated");
                process.exit(0);
            });
        });
    })
    .on('SIGHUP', function () {
        //killAllWorkers('SIGTERM');
        //createWorkers(numCPUs * 2);
    })
    .on('SIGINT', function() {
        'use strict';

        console.log('SIGINT');
        exports.app.close(function () {
            mongoose.connection.close(function () {
                process.exit(1);
            });
        });
    });


