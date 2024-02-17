"use strict";

// github: https://github.com/ewwink/AudioToWAV/
// todo: get original audio bitrate using https://github.com/Borewit/music-metadata-browser

class AudioToWAV {
    constructor(fileInput) {
        this.anchor = document.querySelector('#downloadLink')
        if (!this.anchor) {
            this.anchor = document.createElement('a');
            this.anchor.id = "downloadLink";
            this.anchor.style = 'display: none';
            document.body.appendChild(this.anchor);
        }
        this.fileInput = fileInput;
        this.wavBlob = null;
        this.sampleRate = 24000;
    }

    convert() {
        return new Promise((resolve, reject) => {
            let audioCtx = new AudioContext();
            let fileReader = new FileReader();
            let self = this;
            fileReader.onload = function(ev) {
                // Decode audio
                audioCtx.decodeAudioData(ev.target.result).then(function(buffer) {
                    let offlineAudioCtx = new OfflineAudioContext({
                        numberOfChannels: 1,
                        length: self.sampleRate * buffer.duration,
                        sampleRate: self.sampleRate,
                    });

                    let soundSource = offlineAudioCtx.createBufferSource();
                    soundSource.buffer = buffer;
                    soundSource.connect(offlineAudioCtx.destination);

                    let reader2 = new FileReader();

                    reader2.onload = function(ev) {
                        offlineAudioCtx.startRendering().then(function(renderedBuffer) {
                            self.wavBlob = self.bufferToWave(renderedBuffer, offlineAudioCtx.length);
                            resolve(self.wavBlob)

                        }).catch(function(err) {
                            console.log('convert error: ', err);
                            throw 'error';

                        });
                    };

                    reader2.readAsArrayBuffer(self.fileInput);
                    soundSource.start(0);
                });
            };
            fileReader.readAsArrayBuffer(self.fileInput);
        })
    }

    setSampleRate(rate) {
        this.sampleRate = rate;
    }
    async download() {
        if (!this.wavBlob) {
            await this.convert();
        }
        let wavUrl = URL.createObjectURL(this.wavBlob);
        let name = this.generateFileName()
        this.anchor.href = wavUrl;
        this.anchor.download = name
        this.anchor.click()
        window.URL.revokeObjectURL(wavUrl)
    }

    generateFileName() {
        let origin_name = this.fileInput.name;
        let pos = origin_name.lastIndexOf('.');
        let no_ext = origin_name.slice(0, pos);

        return no_ext + ".compressed.wav";
    }

    bufferToWave(abuffer, len) {
        let numOfChan = abuffer.numberOfChannels,
            length = len * numOfChan * 2 + 44,
            buffer = new ArrayBuffer(length),
            view = new DataView(buffer),
            channels = [],
            i, sample,
            offset = 0,
            pos = 0;

        // write WAVE header
        setUint32(0x46464952); // "RIFF"
        setUint32(length - 8); // file length - 8
        setUint32(0x45564157); // "WAVE"

        setUint32(0x20746d66); // "fmt " chunk
        setUint32(16); // length = 16
        setUint16(1); // PCM (uncompressed)
        setUint16(numOfChan);
        setUint32(abuffer.sampleRate);
        setUint32(abuffer.sampleRate * 2 * numOfChan); // avg. bytes/sec
        setUint16(numOfChan * 2); // block-align
        setUint16(16); // 16-bit (hardcoded in this demo)

        setUint32(0x61746164); // "data" - chunk
        setUint32(length - pos - 4); // chunk length

        // write interleaved data
        for (i = 0; i < abuffer.numberOfChannels; i++)
            channels.push(abuffer.getChannelData(i));

        while (pos < length) {
            for (i = 0; i < numOfChan; i++) { // interleave channels
                sample = Math.max(-1, Math.min(1, channels[i][offset])); // clamp
                sample = (0.5 + sample < 0 ? sample * 32768 : sample * 32767) | 0; // scale to 16-bit signed int
                view.setInt16(pos, sample, true); // write 16-bit sample
                pos += 2;
            }
            offset++ // next source sample
        }

        // create Blob
        return new Blob([buffer], {
            type: "audio/wav"
        });

        function setUint16(data) {
            view.setUint16(pos, data, true);
            pos += 2;
        }

        function setUint32(data) {
            view.setUint32(pos, data, true);
            pos += 4;
        }
    }
}
