var width = 320;
var height = 0;
var streaming = false;

var video = null;
var canvas = null;
var photos = null;
var startbutton = null;

video = document.getElementById('video');
canvas = document.getElementById('canvas');
photos = document.querySelectorAll("img");
startbutton = document.getElementById('shot-btn');

navigator.mediaDevices.getUserMedia({video: true, audio: false})
.then(function(stream) {
  video.srcObject = stream;
  video.play();
})
.catch(function(err) {
  console.log("An error occurred: " + err);
});

video.addEventListener('canplay', function(ev){
  if (!streaming) {
    height = video.videoHeight / (video.videoWidth/width);

    if (isNaN(height)) {
      height = width / (4/3);
    }
  
    video.setAttribute('width', width);
    video.setAttribute('height', height);
    canvas.setAttribute('width', width);
    canvas.setAttribute('height', height);
    streaming = true;
  }
}, false);

startbutton.addEventListener('click', function(ev)
{
  TakePicture();
  ev.preventDefault();
}, false);

Clear();

function Clear()
{
  var context = canvas.getContext('2d');
  context.fillStyle = "#AAA";
  context.fillRect(0, 0, canvas.width, canvas.height);

  var data = canvas.toDataURL('image/png');
  photos.forEach(photo => {
    photo.setAttribute('src', data);
  });
}

function TakePicture()
{
  var context = canvas.getContext('2d');
  if (width && height) {
    canvas.width = width;
    canvas.height = height;
    context.drawImage(video, 0, 0, width, height);
  
    var data = canvas.toDataURL('image/png');
    photos.forEach(photo => {
      photo.setAttribute('src', data);
    });
  } else {
    Clear();
  }
}
  