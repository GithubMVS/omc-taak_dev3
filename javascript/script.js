{
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

    // Generate random balls
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
            r: 8
        }

        objects.push(object);
    }

    // Init HandTrackJS
    const bootGame = () => {
        console.log('in boot game');
        handTrack.startVideo(video).then(status => {
            if (status) {
                navigator.getUserMedia({ video: {} }, stream => {
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    video.srcObject = stream;
                    runDetection();
                    setInterval(runDetection, 200); // doet de runDetection om de X seconden
                },
                    err => console.log(err)
                );
            }
        })
    }

    // Game logica
    const runDetection = () => {
        model.detect(video).then(predictions => {

            model.renderPredictions(predictions, canvas, ctx, video)  // kan straks terug opzetten of wegdoen.

            if (predictions && predictions[0]) {
                current_x = ((predictions[0].bbox[0] * (window.innerWidth - predictions[0].bbox[2])) / canvas.width);
                current_y = ((predictions[0].bbox[1] * window.innerHeight - predictions[0].bbox[3]) / canvas.height);
                cursor.style.display = "block";
                body.style.background = "green";

                let tracker = canvas.getContext("2d");
                tracker.beginPath();
                tracker.fillStyle = "blue";
                tracker.arc(current_x, current_y, 50, 0, 2 * Math.PI);
                tracker.fill();
                tracker.lineWidth = 10;
                tracker.strokeStyle = "yellow";
                tracker.stroke();
                tracker.closePath();
                trackerX = (canvas.width / tracker.width);
                trackerY = (canvas.height / tracker.height);

                let time = Date.now();
                if (time > (lastSpawn + spawnRate)) {
                    lastSpawn = time;
                    spawnRandomObject();
                }

                // berekening
                let paddleLeft = trackerX;
                let paddleRight = trackerX + tracker.width;
                let paddleTop = trackerY;
                let paddleBottom = trackerY + tracker.height;

                for (let i = 0; i < objects.length; i++) {
                    let object = objects[i];
                    object.y += spawnRateOfDescent;
                    ctx.beginPath();
                    ctx.arc(object.x, object.y, object.r, 0, Math.PI * 2);
                    ctx.closePath();
                    ctx.fillStyle = object.type;
                    ctx.fill();


                    // Collision test: Deel 3
                    // Is de ball horizontaal over de paddle?
                    if (objectRight > paddleLeft && objectLeft < paddleRight) {

                        // Einde van het spel
                        clearInterval(theInterval);
                        alert('Game Over - ball  has collided with paddle');
                    }


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


    // Start application
    const init = () => {
        bootGame();
    };

    init();

}
