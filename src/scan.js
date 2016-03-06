const Socket = require('net').Socket
const dgram = require('dgram')
const ping = require('net-ping')
const TIMEOUT = 200

var checkPort
var message = new Buffer('TESTING')

module.exports = function (op){
  if(op.method === 'tcp'){
    op.hosts.forEach( function (host){
        checkTCPPort(host, op.ports)
    })
  }else if(op.method === 'udp'){
    op.hosts.forEach( function (host){
      checkUDPPort(host, op.ports)
    })
  }else{
    op.hosts.forEach( function (host){
      checkICMP(host, function (err, host){
        if(err){
          if(err instanceof ping.RequestTimedOutError){
            console.log (host + ': Unreachable')
          }else{
            console.log (host + ': ' + err.toString())
          }
        }else{
          console.log (host + ': Pinged')
        }
      })
    })
  }
}

var checkICMP = function (host, cb){
  try{
    var session = ping.createSession({retries: 1, timeout: 2000})
  }catch(ex){
    console.log("Must be run with administrative privileges")
    return
  }

  session.on('error', function (error) {
  	console.trace(error.toString())
  })

  session.pingHost(host, function (err, host){
    cb(err, host)
	})
}

var checkUDPPort = function (host, ports, cb){
  ports.forEach(function (port){
    var server = dgram.createSocket('udp4')
    server.send(message, 0, message.length, port, host)
    server.close()
    console.log("UDP packet sent, but that's all I can do")
  })
}

var checkTCPPort = function (host, ports){
  ports.forEach(function (port){
    var socket = new Socket()
    var open = false
    socket.setTimeout(TIMEOUT)

    socket.on('connect', function() {
      open = true
      socket.destroy()
    })
    socket.on('timeout', function() {
     socket.destroy()
    })
    socket.on('close', function() {
      if(open){
        console.log('%s open on port %s', host, port)
      }else{
        console.log('%s closed on port %s', host, port)        
      }
    })

    socket.connect(port, host)
  })
}
