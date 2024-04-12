### Imports

De code begint met het importeren van de `vision` bibliotheek van de CDN. Hieruit worden specifieke klassen geëxtraheerd die nodig zijn voor het project:

- `FaceLandmarker`: Voor gezichtslandmarkdetectie.
- `FilesetResolver`: Voor het laden van de benodigde bestanden.
- `DrawingUtils`: Voor het tekenen van resultaten op het canvas.

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

