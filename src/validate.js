const fs = require('fs')
const path = require('path')
const netmask = require('netmask').Netmask

exports.idate = function (p){
  var options = {
    valid: true
  }
  //tr needs only valid host
  if(p.traceroute){
    if(!validateHost(p.host)) {
      options.valid = false
      options.msg = 'invalid host; must be in ip4 address format'
      return options
    } else {
      options.valid = true
    }
  //make sure each option is valid for each respective functionality
  }else{
    if(!p.traceroute && !p.method && !(p.host || p.hostFile) && !p.port){
      options.valid = false
      return options
    }else if(!(p.host || p.hostFile)){
      options.valid = false
      options.msg = '\tYou must specify the host (-h)\n\t--help for usage'
      return options
    }else if(!p.port && p.method !== 'icmp'){
      options.valid = false
      options.msg = '\tYou must specify the port (-p)\n\t--help for usage'
      return options
    }else if(!p.method){
      options.valid = false
      options.msg = '\tYou must specify the method (-M)\n\t--help for usage'
      return options
    }

    if(p.host){
      if(/^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])(\/([0-9]|[1-2][0-9]|3[0-2]))$/.test(p.host)){
        var block = new netmask(p.host)
        options.hosts = []
        block.forEach(function (ip, long, index){
          options.hosts.push(ip)
        })
      }else if(p.host.split('-')[1]){
        var firstHost = p.host.split('-')[0]
        var lastHost = p.host.split('-')[1]

        var host2 = lastHost.split('.')
        if(host2.length < 4 && host2.length > 1){
          options.valid = false
          options.msg = 'Invalid host range'
          return options
        }

        var host1 = firstHost.split('.')

        options.hosts = []

        if(Number(lastHost) < 256 && Number(lastHost) >= 0){
          for(var i = Number(host1[3]); i <= Number(lastHost); i++){
            options.hosts.push(host1[0] + '.' + host1[1] + '.' + host1[2] + '.' + i)
          }
        }else if((host1[0] !== host2[0]) || (host1[1] !== host2[1]) || (host1[2] !== host2[2])){
            options.valid = false
            options.msg = 'Invalid host range'
            return options
        }else if(Number(host2[3]) < 256 && Number(host2[3]) >= 0){
          for(var i = Number(host1[3]); i <= Number(host2[3]); i++){
            options.hosts.push(host1[0] + '.' + host1[1] + '.' + host1[2] + '.' + i)
          }
        }
        if(!options.hosts.length){
          options.valid = false
          options.msg = 'Invalid host range'
          return options
        }
      }else{
        options.hosts = [p.host]
      }
    }

    if(p.hostFile){
      var data = fs.readFileSync(path.join(__dirname, '../' + p.hostFile), 'utf8').split('\n')
      options.hosts = []
      data.forEach(function (host){
        if(host === '') return
        if(!validateHost(host)) {
          options.valid = false
          options.msg = 'invalid host in file; must be in ip4 address format'
          return options
        }else {
          options.hosts.push(host.trim())
        }
      })
    }

    if(p.port && p.port.split('-')[1]){
      var firstPort = Number(p.port.split('-')[0])
      var lastPort = Number(p.port.split('-')[1])
      if(lastPort < firstPort || lastPort > 65535 || firstPort < 1){
        options.valid = false
        options.msg = 'Invalid port range'
        return options
      }
      options.ports = []
      for(var i = firstPort; i <= lastPort; i++){
        options.ports.push(i)
      }
    }else{
      if(p.port > 65535 || p.port < 1){
        options.valid = false
        options.msg = 'Invalid port'
        return options
      }
      options.ports = [p.port]
    }
  }

  if(!p.traceroute && !/^(tcp|udp|icmp)$/.test(p.method)){
    options.valid = false
    options.msg = '\tInvalid method'
  }else{
    options.method = p.method
  }
  return options
}

var validateHost = function (host){
  var pattern = new RegExp('(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)(\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}')
  return pattern.test(host)
}
