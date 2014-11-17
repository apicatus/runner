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


var express = require('express'),
    router = express.Router(),
    bodyParser = require('body-parser'),
    path = require('path'),
    http = require('http'),
    https = require('https');

var app = express();

///////////////////////////////////////////////////////////////////////////////
// Configuration                                                             //
///////////////////////////////////////////////////////////////////////////////
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.set('title', 'Runner');

var cookieParser = require('cookie-parser');
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));


app.get('/', function(req, res) {
    res.render('index', { title: 'Router' });
});

var server = app.listen(process.env.VCAP_APP_PORT || 3000, function () {

  var host = server.address().address
  var port = server.address().port

  console.log('Example app listening at http://%s:%s', host, port)

});

