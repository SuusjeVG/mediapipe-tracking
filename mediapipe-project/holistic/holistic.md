# Overzicht
De live perceptie van gelijktijdige menselijke poses, gezichtslandmarken en handtracking in real-time op mobiele apparaten maakt diverse toepassingen in het moderne leven mogelijk: analyse van fitness en sport, gebarenbesturing en herkenning van gebarentaal, augmented reality passen en effecten. 

Deze samenvatting geeft een overzicht van de geavanceerde mogelijkheden van MediaPipe Holistic voor het gelijktijdig tracken van menselijke poses, gezichtslandmarken en handbewegingen, en benadrukt de brede toepasbaarheid ervan in verschillende moderne technologische toepassingen.  

![holistic_sports_and_gestures_example.gif](https://mediapipe.dev/images/mobile/holistic_sports_and_gestures_example.gif) |
:----------------------------------------------------------------------------------------------------: |
*Fig 1. Example of MediaPipe Holistic.*                 


## Belangrijke Elementen in het HTML-document

- Video element:
```html
<video id="webcam" playsinline autoplay></video>
```

- Canvas element:
```html
<canvas id="output_canvas" width="1280px" height="720px"></canvas>
```

## Scripts (javascript)

### Configuratie HTML elementen

Dit deel van de code zorgt voor het ophalen van de video- en canvas-elementen.

```javascript
const videoElement = document.getElementById("webcam");
const canvasElement = document.getElementById(
    "output_canvas"
  );
const canvasCtx = canvasElement.getContext("2d");

```

### Voorspelling en Rendering

De volgende functie handelt de rendering van de resultaten af, inclusief de augmented reality effecten:

```javascript
function onResults(results) {
  canvasCtx.save();
  canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);

  // This perfoms alpha blending with your body so it only tracks and blends the person nog the suroundings
  canvasCtx.drawImage(results.segmentationMask, 0, 0,
        canvasElement.width, canvasElement.height);

  // Only overwrite existing pixels.
  canvasCtx.globalCompositeOperation = 'source-in';
  canvasCtx.fillStyle = '#00FF00';
  canvasCtx.fillRect(0, 0, canvasElement.width, canvasElement.height);

  // Only overwrite missing pixels.
  canvasCtx.globalCompositeOperation = 'destination-atop';
  canvasCtx.drawImage(
      results.image, 0, 0, canvasElement.width, canvasElement.height);

  canvasCtx.globalCompositeOperation = 'source-over';
  drawConnectors(canvasCtx, results.poseLandmarks, POSE_CONNECTIONS,
                 {color: '#00FF00', lineWidth: 4});
  drawLandmarks(canvasCtx, results.poseLandmarks,
                {color: '#FF0000', lineWidth: 2});
  drawConnectors(canvasCtx, results.faceLandmarks, FACEMESH_TESSELATION,
                 {color: '#C0C0C070', lineWidth: 1});
  drawConnectors(canvasCtx, results.leftHandLandmarks, HAND_CONNECTIONS,
                 {color: '#CC0000', lineWidth: 5});
  drawLandmarks(canvasCtx, results.leftHandLandmarks,
                {color: '#00FF00', lineWidth: 2});
  drawConnectors(canvasCtx, results.rightHandLandmarks, HAND_CONNECTIONS,
                 {color: '#00CC00', lineWidth: 5});
  drawLandmarks(canvasCtx, results.rightHandLandmarks,
                {color: '#FF0000', lineWidth: 2});
  canvasCtx.restore();
}
```

### Initialisatie van holistic Landmarker

De Holistic Landmarker wordt geconfigureerd met opties die zijn prestaties en nauwkeurigheid verbeteren:

```javascript
const holistic = new Holistic({locateFile: (file) => {
    return `https://cdn.jsdelivr.net/npm/@mediapipe/holistic/${file}`;
}});

holistic.setOptions({
    modelComplexity: 1,
    smoothLandmarks: true,
    enableSegmentation: true,
    smoothSegmentation: true,
    refineFaceLandmarks: true,
    minDetectionConfidence: 0.5,
    minTrackingConfidence: 0.5
});

holistic.onResults(onResults);
```

Dit script initialiseert de holistic Landmarker door configuratie opties toe te voegen aan holistic variable.

## Cross-platform Configuratieopties

De benaming en beschikbaarheid kunnen licht verschillen over verschillende platforms/talen. Hieronder staan de configuratieopties:

| Optienaam                    | Beschrijving                                                                                                                                                                                                                                                                                                                                                                                        | Standaardwaarde |
|------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-----------------|
| `static_image_mode`          | Als ingesteld op `false`, behandelt de oplossing de invoerbeelden als een videostream. Het probeert de meest prominente persoon in de eerste beelden te detecteren en lokaliseert vervolgens de pose en andere landmarks. In volgende beelden volgt het gewoon deze landmarks zonder een nieuwe detectie aan te roepen, tenzij het spoor verloren gaat, wat berekening en latentie vermindert. Als `true`, wordt detectie uitgevoerd bij elk beeld, ideaal voor een batch van statische, mogelijk niet-verwante beelden. | false           |
| `model_complexity`           | Complexiteit van het pose landmark model: 0, 1 of 2. De nauwkeurigheid van landmarks en de inferentie latentie nemen over het algemeen toe met de modelcomplexiteit.                                                                                                                                                                                                                                   | 1               |
| `smooth_landmarks`           | Als ingesteld op `true`, filtert de oplossing pose landmarks over verschillende invoerbeelden om jitter te verminderen, maar wordt genegeerd als `static_image_mode` ook op `true` is ingesteld.                                                                                                                                                                                                     | true            |
| `enable_segmentation`        | Indien ingesteld op `true`, genereert de oplossing naast de pose, gezicht en hand landmarks ook een segmentatiemasker.                                                                                                                                                                                                                                                                               | false           |
| `smooth_segmentation`        | Als ingesteld op `true`, filtert de oplossing segmentatiemaskers over verschillende invoerbeelden om jitter te verminderen. Wordt genegeerd als `enable_segmentation` op `false` is of `static_image_mode` op `true` is.                                                                                                                                                                               | true            |
| `refine_face_landmarks`      | Of de landmarkcoördinaten rond de ogen en lippen verder verfijnd moeten worden, en of extra landmarks rond de irissen moeten worden uitgevoerd.                                                                                                                                                                                                                                                      | false           |
| `min_detection_confidence`   | Minimale vertrouwenswaarde ([0.0, 1.0]) van het persoonsdetectiemodel voor de detectie om als succesvol beschouwd te worden.                                                                                                                                                                                                                                                                         | 0.5             |
| `min_tracking_confidence`    | Minimale vertrouwenswaarde ([0.0, 1.0]) van het landmark-trackingmodel voor de pose landmarks om als succesvol gevolgd te worden beschouwd, anders wordt persoonsdetectie automatisch geïnvokeerd op het volgende invoerbeeld. Een hogere waarde kan de robuustheid van de oplossing verhogen ten koste van hogere latentie. Genegeerd als `static_image_mode` `true` is.                              | 0.5             |

Deze tabel biedt gedetailleerde informatie over de instellingen die je kunt aanpassen om de functionaliteit van de oplossing af te stemmen op je specifieke behoeften.

### Uitvoer

De naamgeving kan enigszins verschillen over verschillende platforms/talen.

### Pose_landmarks

Een lijst met pose-landmarken. Elk landmark bestaat uit het volgende:

*   `x` en `y`: Coördinaten van de landmark, genormaliseerd naar `[0.0, 1.0]` door respectievelijk de breedte en hoogte van de afbeelding.
*   `z`: Moet worden genegeerd aangezien het model momenteel niet volledig is getraind om diepte te voorspellen, maar dit staat wel op de routekaart.
*   `zichtbaarheid`: Een waarde in `[0.0, 1.0]` die de waarschijnlijkheid aangeeft dat de landmark zichtbaar is (aanwezig en niet bedekt) in de afbeelding.

### Pose_world_landmarks

Een andere lijst met pose-landmarken in wereldcoördinaten. Elk landmark bestaat uit het volgende:

*   `x`, `y` en `z`: Echte wereld 3D-coördinaten in meters met de oorsprong in het midden tussen de heupen.
*   `zichtbaarheid`: Identiek aan die gedefinieerd bij de overeenkomstige [pose_landmarks](#pose_landmarks).

### Face_landmarks

Een lijst van 468 gezichtslandmarken. Elk landmark bestaat uit `x`, `y` en `z`. `x` en `y` zijn genormaliseerd naar `[0.0, 1.0]` door de breedte en hoogte van de afbeelding respectievelijk. `z` vertegenwoordigt de diepte van de landmark met de diepte in het midden van het hoofd als de oorsprong, en hoe kleiner de waarde hoe dichter de landmark bij de camera is. De grootte van `z` gebruikt ongeveer dezelfde schaal als `x`.

### Left_hand_landmarks

Een lijst van 21 handlandmarken op de linkerhand. Elk landmark bestaat uit `x`, `y` en `z`. `x` en `y` zijn genormaliseerd naar `[0.0, 1.0]` door de breedte en hoogte van de afbeelding respectievelijk. `z` vertegenwoordigt de diepte van de landmark met de diepte bij de pols als de oorsprong, en hoe kleiner de waarde hoe dichter de landmark bij de camera is. De grootte van `z` gebruikt ongeveer dezelfde schaal als `x`.

### Right_hand_landmarks

Een lijst van 21 handlandmarken op de rechterhand, in dezelfde representatie als [left_hand_landmarks](#left_hand_landmarks).

### Segmentation_mask

Het uitvoersegmentatiemasker, voorspeld alleen wanneer [enable_segmentation](#enable_segmentation) op `true` is ingesteld. Het masker heeft dezelfde breedte en hoogte als de invoerafbeelding en bevat waarden in `[0.0, 1.0]` waar `1.0` en `0.0` een hoge zekerheid aangeven van respectievelijk een "menselijk" en "achtergrond" pixel. Raadpleeg de platformspecifieke gebruiksvoorbeelden hieronder voor gebruiksdetails.        


### Webcam Activeren en Landmarks Detecteren

```javascript
const camera = new Camera(videoElement, {
  onFrame: async () => {
    await holistic.send({image: videoElement});
  },
  width: 1280,
  height: 720
});
camera.start();
```





