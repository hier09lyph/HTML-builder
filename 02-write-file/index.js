const{stdin, stdout, stderr} = process;

const fs = require('fs');
const path = require('path');
let index = 1


fs.writeFile(
    path.join(__dirname, 'mynotes.txt'), '',
    (err) => {
        if (err) throw err;
    }
);

function addNote(data){
fs.appendFile(
  path.join(__dirname,'mynotes.txt'), `Note ${index}: ${data}`,
  err => {
      if (err) throw err;
      console.log("Note added, add a new note or exit the process.");
  }
  )
  index +=1
};

stdout.write('Hello! Add new note:\n');
stdin.on('data', data => {
  if(data.toString().includes('exit')){
    process.exit()
  }
  addNote(data.toString())
});
process.on('SIGINT', () => process.exit())
process.on('exit', () => stdout.write("The process of adding entries has been terminated at the user's request."));
