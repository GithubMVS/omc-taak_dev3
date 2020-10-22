

const modelParams = {
    flipHorizontal: true,   // flip e.g for video 
    imageScaleFactor: 0.7,  // reduce input image size .
    maxNumBoxes: 20,        // maximum number of boxes to detect
    iouThreshold: 0.5,      // ioU threshold for non-max suppression
    scoreThreshold: 0.79,    // confidence threshold for predictions.
}


navigator.getUserMedia =
    navigator.getUserMedia ||
    navigator.webkitGetUserMedia ||
    navigator.mozGetUserMedia ||
    navigator.msGetUserMedia;

//selecteer alles in mijn html
const video = document.querySelector('#video');
const audio = document.getElementById('audio');
const canvas = document.querySelector('#canvas');
const context = canvas.getContext('2d');
let model;

handTrack.startVideo(video)
    .then(status => {
        if (status) {
            navigator.getUserMedia({ video: {} }, stream => {
                video.srcObject = stream;
                runDetection();
                // setInterval(runDetection, 200); // doet de runDetection om de seconden

            },
                err => console.log(err)

            );
        }
    })

function runDetection() {
    model.detect(video).then(predictions => {
        console.log(predictions);
        // model.renderPredictions(predictions, canvas, context, video) kan straks terug opzetten.
        if (predictions.length > 0) { // hier zetten dat vanaf er een hand op beeld komt dat het mannetje moeet springen

            audio.play(); // hier ingeven dat hij moet springen wanneer hij op beeld komt
        }
        requestAnimationFrame(runDetection);
    });
}
handTrack.load(modelParams).then(lmodel => {
    model = lmodel;
});
