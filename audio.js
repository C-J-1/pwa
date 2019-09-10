document.getElementById("myBtn").addEventListener("click", function(){

  var startAudioFunc = function () {

      var aContext = new AudioContext();
      var buffSizeRend = 16384;
      var canvas = document.getElementById('canv');
      var canvasCtx = canvas.getContext("2d");

      var micStream = null,
      gainNode = null,
      scriptProcessNode = null,
      scriptProcessAnalysis = null,
      analyserNode = null;


      if (!navigator.getUserMedia)
          navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia ||
          navigator.mozGetUserMedia || navigator.msGetUserMedia;

      if (navigator.getUserMedia){

          navigator.getUserMedia({audio:true},
              function(stream) {
                  start_microphone(stream);
              },
              function(e) {alert('Microphone not found.');}
              );

      } else { alert('The getUserMedia API is not supported by this browser.'); }


      function processMicBuffer(event) {
          var i, N, inp, micOutBuffer;
          micOutBuffer = event.inputBuffer.getChannelData(0); // mono audio channel
      }

      function start_microphone(stream){

          gainNode = aContext.createGain();
          gainNode.connect( aContext.destination );

          micStream = aContext.createMediaStreamSource(stream);
          micStream.connect(gainNode);

          scriptProcessNode = aContext.createScriptProcessor(buffSizeRend, 1, 1);
          scriptProcessNode.onaudioprocess = processMicBuffer;

          micStream.connect(scriptProcessNode);

          // Fast Fourier Transform frequency data
          scriptProcessAnalysis = aContext.createScriptProcessor(2048, 1, 1);
          scriptProcessAnalysis.connect(gainNode);

          analyserNode = aContext.createAnalyser();
          analyserNode.smoothingTimeConstant = 0;
          analyserNode.fftSize = 2048;

          micStream.connect(analyserNode);

          analyserNode.connect(scriptProcessAnalysis);

          var buffLength = analyserNode.frequencyBinCount;
          var freqArray = new Uint8Array(buffLength);
          var timeArray = new Uint8Array(buffLength);


          function draw() {
            canvasCtx.clearRect(0, 0, 400, 250);
            var drawVisual = requestAnimationFrame(draw);
            analyserNode.getByteTimeDomainData(timeArray);
            canvasCtx.fillStyle = 'rgb(77, 81, 99,0)';
            canvasCtx.fillRect(0, 0, 400, 250);
            canvasCtx.lineWidth = 2;
            canvasCtx.strokeStyle = 'rgb(255, 255, 255)';
            canvasCtx.beginPath();
            var sliceWidth = 400 * 1.0 / buffLength;
            var x = 0;

            for(var i = 0; i < buffLength; i++) {

              var v = timeArray[i] / 128.0 ;
              var y = v * 250/2;

              if(i === 0) {
                canvasCtx.moveTo(x, y);
              } else {
                canvasCtx.lineTo(x, y);
              }

              x += sliceWidth;
            }

            canvasCtx.lineTo(canvas.width, canvas.height/2);
            canvasCtx.stroke();

          };
          draw();


          scriptProcessAnalysis.onaudioprocess = function() {

              analyserNode.getByteFrequencyData(freqArray);

              // draw spectrogram
              if (micStream.playbackState == micStream.PLAYING_STATE) {
                  console.log(freqArray)
              }
          };
      }
  }();

});
