// Run from inside the "node" folder!

var fs = require('fs');
var patch = require('patcher').patch;

function patchFile(file) {
  fs.readFile('js_src/'+file, 'utf8', function (err, code) {
    // don't patch narcissus because I know nothing about license stuff
    if (file !== 'eventsource.js' && file !== 'narcissus_packed.js') {
      console.log("patching "+file);
      try {
        code = patch(code, file);
      } catch (err) {
        console.error('compiling '+file+' failed: \n'+err.stack);
      }
    }
    fs.writeFile('lib/'+file, code);
  });
}

fs.readdir('js_src', function(err, files) {
  if (err) throw err;
  for (var i=0; i<files.length; i++) {
    if (/\.js$/.exec(files[i])) {
      patchFile(files[i]);
    }
  }
});
