
// use the express framework
var express = require('express');
var app = express();
const http = require('http');

var test_url;// = process.env.TEST_NODE_URL;

var fs = require('fs');
// var code_hash = fs.readFileSync('code_hash.txt','utf8');
// console.log (code_hash);
console.log('The IPADDRESS is:', process.env.IP);
console.log('The message is:', process.env.AZ);
// console.log('The hash is: %s', code_hash);

var ipaddress = process.env.IP;
var message = process.env.AZ;

// morgan: generate apache style logs to the console
var morgan = require('morgan')
app.use(morgan('combined'));

// express-healthcheck: respond on /health route for LB checks
app.use('/health', require('express-healthcheck')());

// main route
app.get('/', function (req, res) {
  res.set({
    'Content-Type': 'text/plain'
  })
  res.send(`${message}`);
});

// health route - variable subst is more pythonic just as an example
var server = app.listen(3000, function () {
  var port = server.address().port;
  console.log('Example app listening on port %s!', port);
});


const data = JSON.stringify({
  todo: 'Buy the milk'
})

var sendMesageToTest = msg => {
  const data = JSON.stringify({
    msg: msg
  });
  const options = {
    host: test_url,
    port: '80',
    path: '/log',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': data.length
    }
  }
  const req = http.request(options, (res) => {
    res.on('data', (d) => {
      process.stdout.write(d)
    })
  })
  req.on('error', (error) => {
    console.error(error)
  })

  req.write(data)
  req.end()
}

process.on('SIGTERM', function () {
  server.close(function () {
    process.exit(0);
  });
});

setTimeout(() => {
  test_url = process.env.TEST_NODE_URL;
  setInterval(() => {
    let timeNow = (new Date()).toTimeString();
    http.get(`http://` + test_url + `/vladi`);
    sendMesageToTest(`regular tick: time: ${timeNow} url is :${process.env.TEST_NODE_URL}`);
  }, 3000);
}, 30000);

// export the server to make tests work
module.exports = server;
