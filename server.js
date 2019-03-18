var express = require('express')
var proxy = require('http-proxy-middleware')
var cors = require('cors')

var app = express();

var whitelist = ['http://localhost:4200', 'http://localhost:3000'];
var corsOptions = {
  origin: function (origin, callback) {
    if (whitelist.indexOf(origin) !== -1) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  }
};

app.use(cors(corsOptions));
app.use('/', (req, res, next) => ((req, res, next) => {
  return proxy({ target: req.query.targetUrl, changeOrigin: true })(req, res, next); 
})(req, res, next));
  
app.listen(3000);