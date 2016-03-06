const http = require('http')
const program = require('commander')
const val = require('./src/validate')
const pkg = require('./package.json')

program
	.version(pkg.version)
  .option('-p, --port <p>', 'select port(s)')
  .option('-h, --host <h>', 'select host(s)')
  .option('-H, --host-file <file>', 'select host file')
  .option('-M, --method <method>', 'select protocol <tcp|udp|icmp>')
  .option('-t, --traceroute', 'perform a traceroute instead')
  .on('--help', function() {
    console.log('  Examples:')
    console.log()
    console.log('    $ -h 127.0.0.1 -p 80 -M tcp')
    console.log('    $ -h 10.10.10.0/24 -p 1-65535 -M udp')
    console.log('    $ -H hosts.txt -M icmp')
    console.log('    $ -t -h 8.8.8.8')
    console.log()
  })
  .parse(process.argv)

var options = val.idate(program)

if(!options.valid){
  if(options.msg){
    console.log(options.msg)
  }else{
    program.help()
  }
  return
}

if(program.traceroute){
  require('./src/tr')(program.host)
}else{
  require('./src/scan')(options)
}
