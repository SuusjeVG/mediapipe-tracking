
import vision from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3";
const { FaceLandmarker, FilesetResolver, DrawingUtils } = vision;

// const videoBlendShapes = document.getElementById("video-blend-shapes");

let faceLandmarker;
let enableWebcamButton;
let webcamRunning = false;

// Before we can use HandLandmarker class we must wait for it to finish
// loading. Machine Learning models can be large and take a moment to
// get everything needed to run.
async function createFaceLandmarker() {

  const filesetResolver = await FilesetResolver.forVisionTasks(
    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm"
  );

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


const video = document.getElementById("webcam");
const canvasElement = document.getElementById(
  "output_canvas"
);

const canvasCtx = canvasElement.getContext("2d");

// Check if webcam access is supported.
const hasGetUserMedia = () => !!navigator.mediaDevices?.getUserMedia;

// If webcam supported, add event listener to button for when user
// wants to activate it.
if (hasGetUserMedia()) {
  enableWebcamButton = document.getElementById(
    "webcamButton"
  );
  enableWebcamButton.addEventListener("click", enableCam);
} else {
  console.warn("getUserMedia() is not supported by your browser");
}

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
