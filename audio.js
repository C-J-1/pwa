document.getElementById("myBtn").addEventListener("click", function(){

  var startAudioFunc = function () {

      var aContext = new AudioContext();
      var buffSizeRend = 16384;

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

          scriptProcessAnalysis.onaudioprocess = function() {

              analyserNode.getByteFrequencyData(freqArray);
              analyserNode.getByteTimeDomainData(timeArray);

              // draw spectrogram
              if (micStream.playbackState == micStream.PLAYING_STATE) {
                  console.log(freqArray)
              }
          };
      }
  }();

});
