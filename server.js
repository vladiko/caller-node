// use the express framework
var express = require('express');
var app = express();
const http = require('http');
const random_name = require('node-random-name');
var server_name = '';

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

app.get('/start', function (req, res) {
  res.set({
    'Content-Type': 'text/plain'
  })
  let timeNow = (new Date()).toTimeString();
  setTimeout(() => {
    sendMesageToTest(`${server_name} POST_START: time: ${timeNow}`);
  }, 500);

  res.send(`post start`);
});

app.get('/close', function (req, res) {
  res.set({
    'Content-Type': 'text/plain'
  })
  let timeNow = (new Date()).toTimeString();
  sendMesageToTest(`${server_name} START ClEANING PRE_CLOSE START: time: ${timeNow}`);
  setTimeout(() => {
    let timeNow = (new Date()).toTimeString();
    sendMesageToTest(`${server_name} END CLLEANING PRE_CLOSE END: time: ${timeNow}`);
    res.send(`pre close`);
    process.exit(0);
  }, 10000);
});

// health route - variable subst is more pythonic just as an example
var server = app.listen(80, function () {
  var port = server.address().port;
  setTimeout(() => {
    sendMesageToTest(`${server_name} LISTENING on port ${port} `);
  }, 2000);
  console.log('Example app listening on port %s!', port);
});

function sendMesageToTest(msg) {
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
  });

  req.write(data)
  req.end()
}

process.on('SIGTERM', function () {
  let timeNow = (new Date()).toTimeString();
  sendMesageToTest(`${server_name} Got SIGTERM - time: ${timeNow}`);

  server.close(function () {
    let timeNow = (new Date()).toTimeString();
    sendMesageToTest(`${server_name} Closed time: ${timeNow}`);
    //process.exit(0);
  });
});

setTimeout(() => {
  test_url = process.env.TEST_NODE_URL;
  setInterval(() => {
    let timeNow = (new Date()).toTimeString();
    http.get(`http://` + test_url + `/vladi`);
    sendMesageToTest(`${server_name} life check: time: ${timeNow}`);
  }, 3000);
}, 200);

server_name = random_name();
let start_time = (new Date()).toTimeString();
setTimeout(() => {
  sendMesageToTest(`${server_name} Started time: ${start_time}`);
}, 1000);

// export the server to make tests work
module.exports = server;
