const ping = require('net-ping')
const Child = require('child_process')
const Dns = require('dns')
const Net = require('net')
const Os = require('os')

module.exports = function (host){

  internals.Traceroute.trace(host, function (err, hops) {
    if (!err){
      hops.forEach( function (hop){
        if(!hop.over){
          for(var key in hop){
            if(key != 'undefined'){
              console.log('Hop %s took %s ms', key, hop[key][0])
            }
          }
        }
      })
    }
  })
}

//taken from https://github.com/jaw187/node-traceroute
//had to include here becuase his source code was broken
'use strict';

const internals = {};
internals.Traceroute = {};

internals.isWin = /^win/.test(Os.platform());

internals.Traceroute.trace = function (host, callback) {


    Dns.lookup(host.toUpperCase(), (err) => {

        if (err && Net.isIP(host) === 0) {
            return callback(new Error('Invalid host'));
        }

        const command = (internals.isWin ? 'tracert -d ' : 'traceroute -q 1 -n ') + host;
        Child.exec(command, (err, stdout, stderr) => {

            if (err) {
                return callback(err);
            }

            const results = internals.parseOutput(stdout);
            return callback(null, results);
        });
    });
};


internals.parseHop = function (hop) {

    var line = hop.replace(/\*/g,'0');

    if (internals.isWin) {
        line = line.replace(/\</g,'');
    }

    const s = line.split(' ');
    for (var i = s.length - 1; i > -1; --i) {
        if (s[i] === '' || s[i] === 'ms') {
            s.splice(i,1);
        }
    }

    return internals.isWin ? internals.parseHopWin(s) : internals.parseHopNix(s);
};


internals.parseHopWin = function (line) {

    if (line[4] === 'Request') {
        return false;
    }

    const hop = {};
    hop[line[4]] = [+line[1], +line[2], +line[3]];

    return hop;
};


internals.parseHopNix = function (line) {

    if (line[1] === '0') {
        return false;
    }

    const hop = {};
    var lastip = line[1];

    hop[line[1]] = [+line[2]];

    for (var i = 3; i < line.length; ++i) {
        if (Net.isIP(line[i])) {
            lastip = line[i];
            if (!hop[lastip]) {
                hop[lastip] = [];
            }
        }
        else {
            hop[lastip].push(+line[i]);
        }
    }

    return hop;
};

internals.parseOutput = function (output) {

    const lines = output.split('\n');
    const hops = [];

    lines.shift();
    lines.pop();

    if (internals.isWin) {
        for (var i = 0; i < lines.length; ++i) {
            if (/^\s+1/.test(lines[i])) {
                break;
            }
        }
        //lines.splice(0,i);
        lines.pop();
        lines.pop();
    }

    for (var i = 0; i < lines.length; ++i) {
        hops.push(internals.parseHop(lines[i]));
    }

    return hops;
};
