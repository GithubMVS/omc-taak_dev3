

// Setup HandTrack JS
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
const body = document.getElementsByTagName("BODY")[0];
const video = document.querySelector('#video');
const audio = document.getElementById('audio');
const canvas = document.querySelector('#canvas');
const cursor = document.getElementById('cursor');
const ctx = canvas.getContext('2d');

let model;

// Ball intervals
let spawnRate = 1000;
let spawnRateOfDescent = 2;
let lastSpawn = -10;
let objects = [];
let startTime = Date.now();

// Tracker postition
let current_x = 0;
let current_y = 0;

// Counter
let score = 0;
let counter = canvas.getContext('2d');



// genereren van random ballen
const spawnRandomObject = () => {

    let t;

    if (Math.random() < 0.50) {
        t = "orange";
    } else {
        t = "yellow";
    }

    let object = {
        type: t,
        x: Math.random() * (canvas.width - 30) + 15,
        y: 0,
        r: 80
    }

    objects.push(object);
}

// Hittest calculation
isIntersect = (point, circle) => {
    const sqrt = Math.sqrt(Math.pow((point.x - circle.x), 2) + Math.pow((point.y - circle.y), 2));
    return sqrt < circle.r;
}

// Init HandTrackJS
handTrack.startVideo(video).then(status => {
    if (status) {
        navigator.getUserMedia({ video: {} }, stream => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            video.srcObject = stream;
            runDetection();

            //setInterval(runDetection, 200); // doet de runDetection om de X seconden
        },
            err => console.log(err)
        );
    }
})

// Game logica





const runDetection = () => {

    ctx.font = "30px Arial";
    ctx.fillText(score, 5, 40);

    model.detect(video).then(predictions => {

        model.renderPredictions(predictions, canvas, ctx, video)  // kan straks terug opzetten.

        if (predictions && predictions[0]) {
            const [x, y, width, height] = predictions[0].bbox;
            const centerX = x + (width / 2);
            const centerY = y + (height / 2);

            cursor.style.display = "block";
            body.style.background = "lightgreen";

            let tracker = canvas.getContext("2d");
            tracker.beginPath();
            tracker.fillStyle = "blue";
            tracker.arc(centerX, centerY, 50, 0, 2 * Math.PI);
            tracker.fill();
            tracker.lineWidth = 10;
            tracker.strokeStyle = "yellow";
            tracker.stroke();
            tracker.closePath();

            let time = Date.now();
            if (time > (lastSpawn + spawnRate)) {
                lastSpawn = time;
                spawnRandomObject();
            }

            // Remove 'hit' objects
            objects = objects.filter(object => !object.hit);

            for (let i = 0; i < objects.length; i++) {
                let object = objects[i];
                object.y += spawnRateOfDescent;

                // Hittest detect
                if (isIntersect({ x: centerX, y: centerY }, object)) {
                    object.hit = true;
                    score += 1;
                    ctx.fillText(score, 5, 40);
                    continue; // Rendered geen hit meer.
                }

                ctx.beginPath();
                ctx.arc(object.x, object.y, object.r, 0, Math.PI * 2);
                ctx.closePath();
                ctx.fillStyle = object.type;
                ctx.fill();
            }
        } else {
            body.style.background = "red";
            cursor.style.display = "none";
        }

        requestAnimationFrame(runDetection);
    });
}


handTrack.load(modelParams).then(lmodel => {
    model = lmodel;
});


