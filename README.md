# AudioToWAV
Convert audio to `.wav` file with Browser Javascript. 

Supported formats: MP3, M4A, WMA, WAV, FLAC, OGG, WEBM, WEBA, OPUS

it use Web API [decodeAudioData](https://developer.mozilla.org/en-US/docs/Web/API/BaseAudioContext/decodeAudioData) and [OfflineAudioContext](https://developer.mozilla.org/en-US/docs/Web/API/OfflineAudioContext)
## Example
Run on [JSFiddle](https://jsfiddle.net/6f20qL9c/)
```html
<input type="file" id="audioInput" accept="audio/*" />
<button id="btnConvert">convert</button>

<script src="https://cdn.jsdelivr.net/gh/ewwink/AudioToWAV@main/audio-to-wav.min.js"></script>
<script>
    document.querySelector('#btnConvert').addEventListener('click', async function(e) {
        let audioInput = document.querySelector('#audioInput')
        let audio = new AudioToWAV(audioInput.files[0])
        // audio.setSampleRate(44100) // optional, default set to 24000 or 24Khz
        // await audio.convert(); // convert only to wav blob
        // console.log(audio.wavBlob)
        audio.download(); // convert and download
    })
</script>
```

credit: [here](https://russellgood.com/how-to-convert-audiobuffer-to-audio-file/)
