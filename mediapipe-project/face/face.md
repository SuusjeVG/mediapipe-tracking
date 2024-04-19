# Overzicht

MediaPipe Face Mesh schat in real-time 468 3D-gezichtslandmarken, zelfs op mobiele apparaten. Het maakt gebruik van machine learning (ML) om het 3D-oppervlak van het gezicht te berekenen met enkel een enkele camera, zonder dat een speciale dieptesensor nodig is. Door lichtgewicht modelarchitecturen te combineren met GPU-versnelling, levert het real-time prestaties die essentieel zijn voor live-ervaringen.

![face_mesh_ar_effects.gif](https://mediapipe.dev/images/face_mesh_ar_effects.gif) |


## Belangrijke Elementen in het HTML-document

`<head>`
- Link:
```html
<script type="module" src="js/facetracking.js" defer></script>
<link rel="stylesheet" href="style.css">
```
`</head>`

`<body>`
- Video element:
```html
<video id="webcam" playsinline autoplay></video>
```

- Canvas element:
```html
<canvas id="output_canvas" width="1280px" height="720px"></canvas>
```

- Button element:
```html
<button id="webcamButton">Enable webcam</button>
```
- Blend shapes element:
```html
<!-- <div class="blend-shapes">
  <ul class="blend-shapes-list" id="video-blend-shapes"></ul>
</div> -->
```
`</body>`

## Scripts (javascript)

### Imports

De code begint met het importeren van de `vision` bibliotheek van de CDN. Hieruit worden specifieke klassen geëxtraheerd die nodig zijn voor het project:

- `FaceLandmarker`: Voor gezichtslandmarkdetectie.
- `FilesetResolver`: Voor het laden van de benodigde bestanden.
- `DrawingUtils`: Voor het tekenen van resultaten op het canvas.

```javascript
import vision from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3";
const { FaceLandmarker, FilesetResolver, DrawingUtils } = vision;

// const videoBlendShapes = document.getElementById("video-blend-shapes");

let faceLandmarker;
let enableWebcamButton;
let webcamRunning = false;
```

### Initialisatie van Face Landmarker

```javascript
async function createFaceLandmarker() {

  const filesetResolver = await FilesetResolver.forVisionTasks("https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm");
  
  faceLandmarker = await FaceLandmarker.createFromOptions(filesetResolver, {
    baseOptions: {
      modelAssetPath: `./models/face_landmarker.task`,
      delegate: "GPU",
    },
    outputFaceBlendshapes: true,
    runningMode: "VIDEO",
    numFaces: 1,
  });
}
createFaceLandmarker();
```

Dit script initialiseert de FaceLandmarker door eerst de FilesetResolver te configureren die nodig is om de machine learning modellen te laden. De FaceLandmarker wordt aangemaakt met configuraties zoals het pad naar het model, het gebruik van GPU voor snellere verwerking, en het aantal te detecteren gezichten.

- **Model File Location and Naming:** Het getrainde model dat gespecificeerd wordt in de modelAssetPath bevindt zich in de `models/` map van je project. De bestandsnaam van het model moet het patroon `specifieke-tracking.task` volgen. Zorg ervoor dat je het juiste bestand in deze map plaatst en de juiste bestandsnaam in je configuratie gebruikt. Bijvoorbeeld, als je een face-tracking model gebruikt, kan het bestand genaamd zijn als `face_landmarker.task` en zou je `modelAssetPath: './models/face_landmarker.task'` instellen.

## Configuration Options for MediaPipe FaceLandmarker

This task has the following configuration options:

| Option Name      | Description                                                                                                                                                                   | Value Range             | Default Value |
|---------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-------------------------|---------------|
| `running_mode`                        | Sets the running mode for the task. There are three modes:<br>IMAGE: For single image inputs.<br>VIDEO: For decoded frames of a video.<br>LIVE_STREAM: For a livestream input. | {IMAGE, VIDEO, LIVE_STREAM} | IMAGE       |
| `num_faces`                           | The maximum number of faces that can be detected. Smoothing is only applied when num_faces is set to 1.                                                                        | Integer > 0             | 1             |
| `min_face_detection_confidence`       | The minimum confidence score for face detection to be considered successful.                                                                                                   | Float [0.0,1.0]        | 0.5           |
| `min_face_presence_confidence`        | The minimum confidence score of face presence score in face landmark detection.                                                                                                | Float [0.0,1.0]        | 0.5           |
| `min_tracking_confidence`             | The minimum confidence score for face tracking to be considered successful.                                                                                                    | Float [0.0,1.0]        | 0.5           |
| `output_face_blendshapes`             | Whether Face Landmarker outputs face blendshapes, which are used for rendering the 3D face model.                                                                              | Boolean                | False         |
| `output_facial_transformation_matrixes` | Whether FaceLandmarker outputs the facial transformation matrix, used to transform face landmarks from a canonical face model to the detected face.                           | Boolean                | False         |
| `result_callback`                    | Sets the result listener to receive the landmarker results asynchronously when FaceLandmarker is in the live stream mode. Only used when running mode is set to LIVE_STREAM.   | ResultListener         | N/A           |

### Configuratie van de Webcam en Canvas

```javascript
const video = document.getElementById("webcam");
const canvasElement = document.getElementById("output_canvas");
const canvasCtx = canvasElement.getContext("2d");

// Check if webcam access is supported.
const hasGetUserMedia = () => !!navigator.mediaDevices?.getUserMedia;


if (hasGetUserMedia()) {
  enableWebcamButton = document.getElementById("webcamButton");
  enableWebcamButton.addEventListener("click", enableCam);
} else {
  console.warn("getUserMedia() is not supported by your browser");
}
```

Dit deel van de code zorgt voor het instellen van de video- en canvas-elementen. Het controleert of de browser ondersteuning biedt voor getUserMedia voor toegang tot de webcam. Als dit ondersteund wordt, wordt een event listener toegevoegd aan de knop om de webcam in te schakelen.


### Webcam Activeren en Landmarks Detecteren

```javascript
// Enable the live webcam view and start detection.
function enableCam(event) {
  if (!faceLandmarker) {
    console.log("Wait! faceLandmarker not loaded yet.");
    return;
  }

  webcamRunning = !webcamRunning;
  enableWebcamButton.innerText = webcamRunning ? "DISABLE PREDICTIONS" : "ENABLE PREDICTIONS";

  if (webcamRunning) {
    const constraints = { video: true };
    navigator.mediaDevices.getUserMedia(constraints).then((stream) => {
      video.srcObject = stream;
      video.addEventListener("loadeddata", predictWebcam);
    });
  } else {
    video.srcObject.getTracks().forEach(track => track.stop());
    video.srcObject = null;
  }
}
```

Wanneer de gebruiker de webcam inschakelt, wordt gecontroleerd of de FaceLandmarker is geladen. Vervolgens wordt de webcamstream geactiveerd en klaargezet om voorspellingen te doen met behulp van de predictWebcam functie.


### Voorspelling en Rendering

```javascript
let lastVideoTime = -1;
const drawingUtils = new DrawingUtils(canvasCtx);

async function predictWebcam() {
  // Calculate the aspect ratio of the video to the canvas and if it's not the same, make it the same.
  if (video.videoWidth !== canvasElement.width || video.videoHeight !== canvasElement.height) {
    canvasElement.width = video.videoWidth;
    canvasElement.height = video.videoHeight;
  }

  // Get the current time of the video in milliseconds
  let startTimeMs = performance.now();
  if (lastVideoTime !== video.currentTime) {
    lastVideoTime = video.currentTime;
    let results = await faceLandmarker.detectForVideo(video, startTimeMs); // Asynchronously detect face landmarks
    
    canvasCtx.save();
    // Clear the canvas for new drawing
    canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
    
    // Draw the video frame to the canvas
    // canvasCtx.drawImage(video, 0, 0, canvasElement.width, canvasElement.height); // Draw the video frame to the canvas

    if (results && results.faceLandmarks) {
      

      // Draw the face landmarks on the canvas expanded
      for (const landmarks of results.faceLandmarks) {
        drawingUtils.drawConnectors(
          landmarks,
          FaceLandmarker.FACE_LANDMARKS_TESSELATION,
          { color: "#C0C0C070", lineWidth: 1 }
        );
        drawingUtils.drawConnectors(
          landmarks,
          FaceLandmarker.FACE_LANDMARKS_RIGHT_EYE,
          { color: "#FF3030" }
        );
        drawingUtils.drawConnectors(
          landmarks,
          FaceLandmarker.FACE_LANDMARKS_RIGHT_EYEBROW,
          { color: "#FF3030" }
        );
        drawingUtils.drawConnectors(
          landmarks,
          FaceLandmarker.FACE_LANDMARKS_LEFT_EYE,
          { color: "#30FF30" }
        );
        drawingUtils.drawConnectors(
          landmarks,
          FaceLandmarker.FACE_LANDMARKS_LEFT_EYEBROW,
          { color: "#30FF30" }
        );
        drawingUtils.drawConnectors(
          landmarks,
          FaceLandmarker.FACE_LANDMARKS_FACE_OVAL,
          { color: "#E0E0E0" }
        );
        drawingUtils.drawConnectors(
          landmarks,
          FaceLandmarker.FACE_LANDMARKS_LIPS,
          { color: "#E0E0E0" }
        );
        drawingUtils.drawConnectors(
          landmarks,
          FaceLandmarker.FACE_LANDMARKS_RIGHT_IRIS,
          { color: "#FF3030" }
        );
        drawingUtils.drawConnectors(
          landmarks,
          FaceLandmarker.FACE_LANDMARKS_LEFT_IRIS,
          { color: "#30FF30" }
        );

        // Efficiently draw detected landmarks (not expanded)
        // drawingUtils.drawConnectors(landmarks, FaceLandmarker.FACE_LANDMARKS_TESSELATION, { color: "#C0C0C070", lineWidth: 1 });

        //blendshapes (extra)
        // drawingUtilsdrawBlendShapes(videoBlendShapes, results.faceBlendshapes);
      }
    }
  }

  // Call this function again to keep predicting when the browser is ready
  if (webcamRunning) {
    window.requestAnimationFrame(predictWebcam);
  }
}
```

#### Belangrijke punten:

- Aspect Ratio Correctie: De code berekent de aspectratio van de video en past de hoogte van het videovenster aan om vervorming te voorkomen.

- Landmark Detection en Drawing: De functie detecteert gezichtslandmarken en tekent ze op het canvas. Elk type landmark wordt met een specifieke kleur en lijndikte getekend voor duidelijke visualisatie.

- Animatie Loop: De `window.requestAnimationFrame` roept predictWebcam opnieuw aan zolang de webcam actief is, waardoor een continue stroom van frames wordt verwerkt voor real-time tracking.
Deze functie zal nu effectief de gezichtslandmarken in real-time op het canvas visualiseren, gebruikmakend van de videofeed van de webcam.

### Blend shapes (extra)
De functie drawBlendShapes in de gegeven JavaScript code is bedoeld om een visuele weergave van 'blend shapes' te genereren, die meestal gebruikt worden om gezichtsuitdrukkingen en emoties in digitale karakters te modelleren. Hier is een korte uitleg van wat er in deze functie gebeurt:

```javascript
// function drawBlendShapes(el, blendShapes) {
//   if (!blendShapes.length) {
//     return;
//   }

//   console.log(blendShapes[0]);
  
//   let htmlMaker = "";
//   blendShapes[0].categories.map((shape) => {
//     htmlMaker += `
//       <li class="blend-shapes-item">
//         <span class="blend-shapes-label">${
//           shape.displayName || shape.categoryName
//         }</span>
//         <span class="blend-shapes-value" style="width: calc(${
//           +shape.score * 100
//         }% - 120px)">${(+shape.score).toFixed(4)}</span>
//       </li>
//     `;
//   });

//   el.innerHTML = htmlMaker;
// }
```

- Controle op Lege Data: De functie stopt als de blendShapes array leeg is om onnodige uitvoering te voorkomen.
- Data Loggen: Het eerste object in de blendShapes array wordt gelogd voor debugging.
- HTML Generatie: Er wordt een lijst van HTML `<li>` elementen gegenereerd, elk met een label en een progress bar die de intensiteit van elke blend shape aangeeft. De breedte van elke progress bar is gebaseerd op de score van de blend shape.
- DOM Update: De innerHTML van het meegegeven element el wordt bijgewerkt met de gegenereerde HTML om de visuele representatie van de blend shapes te tonen.

## Documentatie

Voor meer gedetailleerde informatie over MediaPipe Face landmarker en de configuratieopties, bezoek de [officiële MediaPipe Face landmarker documentatie](https://developers.google.com/mediapipe/solutions/vision/face_landmarker/web_js).

## Verdere Referenties

- [MediaPipe Solutions](https://github.com/google/mediapipe/blob/master/docs/solutions/face_mesh.md)
- [MediaPipe op GitHub](https://github.com/google/mediapipe)
