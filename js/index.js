// https://github.com/omgimanerd/audio-spatializer/blob/blog-min-example/client/audio_process.js

let sound, canvas;
let spectrumArray = [];
let waveformArray = [];

function onloaded(sound) {
    var buffer = sound.buffer;
    var offlineAudioContext = new OfflineAudioContext(1, buffer.length, buffer.sampleRate);
    var bufferSource = offlineAudioContext.createBufferSource();
    bufferSource.buffer = buffer;

    var analyser = offlineAudioContext.createAnalyser();
    analyser.smoothingTimeConstant = 0;
    bufferSource.connect(analyser);

    var scp = offlineAudioContext.createScriptProcessor(0, 2, 2);
    scp.connect(offlineAudioContext.destination);

    scp.onaudioprocess = function (audioProcessingEvent) {

        /*
        var rms = 0;
        for (var i = 0; i < array.length; i++) {
            rms += Math.pow(array[i], 2);
        }

        rms = rms / array.length;
        rms = Math.sqrt(rms);
        */



        var freqData = new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteFrequencyData(freqData);
        spectrumArray.push(freqData);

        var waveformData = new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteTimeDomainData(waveformData);
        waveformArray.push(waveformData);
    };

    bufferSource.start(0);
    offlineAudioContext.startRendering().then(
        function (buffer) {
            console.log("Analysing complete!");
            console.log(spectrumArray.length / 60)
            loop();
            sound.play();
        }
    );
}

function preload() {
    sound = loadSound("example.mp3", onloaded);
}

function setup() {
    canvas = createCanvas(710, 400);
    noFill();
    noLoop();
}

var targetFramerate = 60.0;
var frame = 0;
function draw() {
    var percentage = frame / targetFramerate / sound.buffer.duration;
    var s = Math.floor(spectrumArray.length * percentage);
    var spectrum = spectrumArray[s];
    var waveform = waveformArray[s];

    if (s <= spectrumArray.length) {
        frame++;
    } else {
        frame = 0;
    }
    if (spectrum) {
        background(0);
        noStroke();
        fill(0, 255, 0); // spectrum is green
        for (var i = 0; i < spectrum.length; i++) {
            var x = map(i, 0, spectrum.length, 0, width);
            var h = -height + map(spectrum[i], 0, 255, height, 0);
            rect(x, height, width / spectrum.length, h);
        }

        noFill();
        beginShape();
        stroke(255, 0, 0); // waveform is red
        strokeWeight(2);
        for (var i = 0; i < waveform.length; i++) {
            var x = map(i, 0, waveform.length, 0, width);
            var y = map(waveform[i], 0, 255, 0, height);
            vertex(x, y);
        }
        endShape();


        /*
        background(0);
        noStroke();
        fill(0, 255, 0); // spectrum is green
        */
        /*
        for (var i = 0; i < spectrum.length; i++) {
            var x = map(i, 0, spectrum.length, 0, width);
            var h = -height + map(spectrum[i], 0, 255, height, 0);
            rect(x, height, width / spectrum.length, h);
        }
        */
    }
}
