var socket = io();
var myState = 'IDLE';

var prox = 0;

var loopedAudio, oneShotAudio;
var loopedAudio;
var oneShotAudio;
var isOneShotPlaying = false;
var shouldKeepLooping = true;

socket

socket.on('state', function(data){
	var state = data[0];
	prox = data[1];
	console.log(data);

	myState = state !== myState ? state : myState;

	switch (myState) {
	  // Dark
	  case 'DARK':
	    playOneShot('k', 0, 11);
	    break;
	  // Idle
	  case 'IDLE':
	    playOneShot('d', 0, 1);
	    break;
	  // Interact
	  case 'INTERACT':
	    let audioId = Math.floor(mapNumber(prox, 0, 15, 0, 4));
	    isOneShotPlaying = false;
	    playOneShot('be', audioId, audioId);
	    break;
	  // Climax
	  case 'CLIMAX':
	    if(myState != 'CLIMAX') {
	     	isOneShotPlaying = false;
	      playOneShot('n', 0, 0);
	    }
	    break;
	  // Shock
	  case 'SHOCK':
	    if(myState != 'SHOCK') {
	      isOneShotPlaying = false;
	      playOneShot('d', 4, 4);
	    }
	    break;
	  default:
	    break;
	}
});

function playSound(filePrefix, fileNumMin, fileNumMax, shouldLoop) {
  return new Promise(function(resolve, reject) {
    let fileName = filePrefix;
    fileName += fileNumMin === fileNumMax ? fileNumMin : getRandomInt(fileNumMin, fileNumMax);
    fileName += '.mp3';
    if(shouldLoop) {
      loopedAudio = new Howl({
      	src: ['/sfx/' + fileName],
			  autoplay: true,
			  loop: true,
			  volume: 1.0,
			  onend: function() {
			    resolve('Successfully played ' + fileName);
			 	},
			 	onloaderror: function(id, err) {
			 		reject('Can\'t play ' + id + ': ' + err);
			 	}
			});
    }
    else {
      oneShotAudio = new Howl({
      	src: ['/sfx/' + fileName],
			  autoplay: true,
			  volume: 1.0,
			  onend: function() {
			    resolve('Successfully played ' + fileName);
			 	},
			 	onloaderror: function(id, err) {
			 		reject('Can\'t play ' + id + ': ' + err);
			 	}
			});
    }
  })
}

function playLoop(filePrefix, fileNumMin, fileNumMax) {
  if(shouldKeepLooping) {
    playSound(filePrefix, fileNumMin, fileNumMax, true).then(function(msg) {
      playLoop(filePrefix, fileNumMin, fileNumMax);
      console.log(msg);
    })
    .catch(function(err) {
      console.log('Error in loop sound: ' + err);
    });
  }
}

function stopLoop() {
  shouldKeepLooping = false;
}

function playOneShot(filePrefix, fileNumMin, fileNumMax) {
  if(!isOneShotPlaying) {
   isOneShotPlaying = true;
   playSound(filePrefix, fileNumMin, fileNumMax, false).then(function(msg) {
     console.log(msg);
     isOneShotPlaying = false;
   })
   .catch(function(err) {
     console.log('Error in one shot sound: ' + err);
     isOneShotPlaying = false;
   });
  }
}

// Max is inclusive
function getRandomInt(min, max) {
  return min + Math.floor(Math.random() * Math.floor(max + 1));
}

function mapNumber(x, in_min, in_max, out_min, out_max) {
  return (x - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
}