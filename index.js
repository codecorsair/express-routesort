var express = require('express'),
  app = module.exports = express(),
  router = express.Router();

// Route object : {
//  path: string
//  handler: function
//  priority: integer (default 0)  -- priority is handled highest number first
//}

// Param object : {
//  name: string
//  handler: function
//}

var _params = [],
  _gets = [],
  _posts = [],
  _uses = [],
  _options = {};

function sortRoutes(a, b)
{
  if (a.priority !== b.priority) return b.priority - a.priority;
  
  var aHasParams = a.path.indexOf(':') !== -1;
  var bHasParams = b.path.indexOf(':') !== -1;
  if (aHasParams && !bHasParams) return 1;
  if (bHasParams && !aHasParams) return -1;
  
  var aDepth = a.path.split('/').length;
  var bDepth = b.path.split('/').length;
  if (_options.depthFirst) {
    return bDepth - aDepth;
  }
  return aDepth - bDepth;
}

module.exports = {

  // get : override for express.Router().get()
  get: function (arg1, arg2, arg3) {
    if (arguments.length < 2 || arguments.length > 3) throw 'Invalid number of arguments for get function.';
    if (typeof arg1 !== 'string') throw 'First argument of get function must be a route string.';
    if (typeof arg2 !== 'function') throw 'Second argument of get function must be a function.';
    
    _gets.push({
      path: arg1,
      handler: arg2,
      priority: arg3 ? arg3 : 0
    });
  },

  // post : override for express.Router().post()
  post: function (arg1, arg2, arg3) {
    if (arguments.length < 2 || arguments.length > 3) throw 'Invalid number of arguments for post function.';
    if (typeof arg1 !== 'string') throw 'First argument of post function must be a route string.';
    if (typeof arg2 !== 'function') throw 'Second argument of post function must be a function.';
    
    _posts.push({
      path: arg1,
      handler: arg2,
      priority: arg3 ? arg3 : 0
    });
  },

  // use : override for express.Router().use()
  use: function (arg1) {
    if (typeof arg1 !== 'function') throw 'Invalid argument type for use function.';
    _uses.push(arg1);
  },

  // param : override for express.Router().param()
  param: function (arg1, arg2) {
    if (typeof arg1 !== 'string') throw 'First argument of param function must be a param name string.';
    if (typeof arg2 !== 'function') throw 'Second argument of param function must be a function.';
    
    _params.push({
      name: arg1,
      handler: arg2
    });
  },

  // router : use this in the express app to apply the router
  // Router takes an optional parameter to specify options
  // options: {
  //  depthFirst: boolean -- if true (default) deepest level paths are included
  //                         before lower level paths.  ie '/my/deep/path' route
  //                         is used before '/my/path'
  //}
  router: function (options) {
    if (typeof options === 'undefined') {
      _options = {
        depthFirst: true
      }
    }
    else if (typeof options !== 'object') {
      throw 'options must be an object.'
    }
    else {
      if (typeof options.depthFirst === 'undefined') {
        options.depthFirst = true;
      }
      _options = options;
    }

    _uses.forEach(function (fn){
      router.use(fn);
    });

    _params.forEach(function (param) {
      router.param(param.name, param.handler);
    });

    _gets.sort(sortRoutes).forEach(function (route) {
      router.get(route.path, route.handler);
    });

    _posts.sort(sortRoutes).forEach(function (route) {
      router.post(route.path, route.handler);
    })

    return router;
  }
}