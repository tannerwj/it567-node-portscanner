# it567-node-portscanner
A simple port scanner built in node.js.

Before you can run the script, navigate to the folder and type

```bash
npm install
```

## Usage
```node
 Usage: node scan [options]

 Options:

   -h, --help              output usage information
   -V, --version           output the version number
   -p, --port <p>          select port(s)
   -h, --host <h>          select host(s)
   -H, --host-file <file>  select host file
   -M, --method <method>   select protocol <tcp|udp|icmp>
   -t, --traceroute        perform a traceroute instead

 Examples:

   $ -h 127.0.0.1 -p 80 -M tcp
   $ -h 10.10.10.0/24 -p 1-65535 -M udp
   $ -H hosts.txt -M icmp
   $ -t -h 8.8.8.8
```
