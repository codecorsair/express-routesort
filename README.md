
##Express-RouteSort
Express-RouteSort is a lightweight middle-ware for Express 4 that will sort routes using an options priority value, route params, and folder depth.

The idea behind this package is to give you the freedom to structure your app the way you like without having to worry about the order of the express routes.  

###Syntax
Syntax for routes are similar to express routes, with the addition of a priority parameter.  The default priority, if not provided, is 0.  Routes with a higher priority will be used before those with lower.

**use**
> router.use(function (req, res, next) {});

**param**
> router.param('paramName', function (res, res, next, paramName) {});

**get**
> router.get('/route', function (res, res, next){}, priority); 

**post**
> router.post('/route', function (res, res, next){}, priority);

###Basic Usage

In a simple app, this this example below, this package really is not necessary as it is very easy to see the order in which routes are being included and can avoid situations like in the example where a route with a first level param ('/:name') is used before a strictly defined route ('/mypage').  In an express application, using the route '/:name' before the route '/mypage' would result in your application never matching the '/mypage' route.

  var express = require('express'),
    router = require('express-routesort'),
    app = express();

  router.use(function (req, res, next) {
    console.log(req.method, req.url);
    next();
  });

  router.param('name', function (req, res, next, name) {
    console.log(name);
    req.name = name;
    next();
  });

  router.get('/', function (req, res) {
    res.send('Hello World!');
  });

  router.get('/:name', function (req, res) {
    res.send('Hello ' + req.name);
  });

  router.get('/mypage', function (req, res) {
    // Normally you would never hit this with Express
    // based on the order it is being used.
    res.send('I Work!');
  });

  router.post('/post', function (req, res) {
    // do something
  });

  app.use('/', router.router());

  var server = app.listen(3000, function () {
    var host = server.address().address;
    var port = server.address().port;
    console.log('Example app listening at http://%s:%s', host, port);
  });


###Usage with Walk

Where Express-RouteSort really comes in handy is in a situation where you do not know the order a route may be included which can be the case using a directory parser, like "[Walk](https://github.com/coolaj86/node-walk)" for example, to require files that include routes.

This is the situation I found myself in while working on a cms framework I was building using express.  I wanted the ability to include routes from any file whose name matched a specific regex in any folder under a specific directory.  In this way, I was unsure as to the order my routes would be included so, I built this quick package to make my life easier.

Here is an example using walk to parse a directory and include routes from any "route*.js" file in the directory.

*app.js*

  var express = require('express'),
    router = require('express-routesort'),
    walk = require('walk'),
    app = express();

  var walker = walk.walk(__dirname + '/lib', {
    followLinks: false
  });

  var routers = [];
  walker.on('file', function (root, stat, next) {
    if (stat.name.match(/route.*\.js$/i)) {
      routers.push(root + '/' + stat.name);
    }
    next();
  });

  walker.on('end', function() {
    // Setup any express middleware
    ...

    // require all routers
    routers.forEach(function (router) {
      require(router);
    });
    
    // apply routes
    app.use('/', router.router());

    var server = app.listen(3000, function () {
      var host = server.address().address;
      var port = server.address().port;
      console.log('Example app listening at http://%s:%s', host, port);
    });
  });

*/lib/users/router.js*
  
  var router = require('express-routesort');
  
  router.post('/login', function (req, res) {
    // Login user
  });

  router.get('/u/:user', function (req, res) {
    // show user profile
  });

  router.get('/api/user/:user', function (req, res) {
    // return user info
  }, 1); // giving this route a priority of 1 will place it in front of
       // any route with a lower priority.  Default priority is 0. 

  // and so on...

*/lib/posts/router.js*

  var router = require('express-routesort');
  
  router.get('/', function (req, res) {
    // show posts
  });

  router.get('/:title', function (req, res) {
    // show a single post
  });

  // and so on...
  
Walk typically will find files / folder based on alphabetical order.  If that were the case, and if each of these files use the standard express router, then the post router would be run before the user router.  This would mean the '/:title' route would override all of the routes within the user router as it will match the route first in the route stack.

However, with Express-RouteSort the routes are included as follows:

  GET '/api/user/:user'
  GET '/'
  GET '/login'
  GET '/u/:user'
  GET '/:title'

Now with this sorting, your routing will work just as you intended!

##Options##
> - router(options)
  - **options**
    - depthFirst : string -- default (true)  -- If true deepest paths are included before lower level paths.  ie: '/my/deep/path' route is used before '/my/path'

###Contribute
You are welcome to do a pull request.

###Author
 - James Brown "JB" -- [jb@codecorsair.com](mailto:jb@codecorsair.com) -- [blog](https://codecorsair.com)

###License
Copyright (c) 2014 James Brown [jb@codecorsair.com](mailto:jb@codecorsair.com)

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

