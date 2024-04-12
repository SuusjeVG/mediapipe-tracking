# MediaPipe Motion Tracking Project

![MediaPipe](https://developers.google.com/static/mediapipe/images/home/hero_01_1920.png)

## Overzicht

Dit project gebruikt MediaPipe, een geavanceerd framework ontwikkeld door Google, om diverse motion tracking technologieën te implementeren. Het project is opgedeeld in vier belangrijke onderdelen: Face Tracking, Hand Pose, Pose Estimation en Holistic Detection, die elk gebruik maken van de webcam technologie voor real-time detectie en analyse.

## Projectstructuur

Het project is georganiseerd in vier hoofdmappen, elk toegewijd aan een specifieke MediaPipe technologie:

- `face/` - Voor gezichtsdetectie en tracking.
- `hands/` - Voor handpose detectie.
- `pose/` - Voor pose estimatie van het lichaam.
- `holistic/` - Voor een holistische benadering die gezicht, handen en pose combineert.

Elke map bevat een `index.html`, `style.css`, `script.js`, en een `models/` submap met de nodige getrainde modellen. Daarnaast bevat elke map een eigen `README.md` met gedetailleerde informatie en instructies specifiek voor dat onderdeel.

## Installatie

Om dit project te gebruiken, clone de repository naar je lokale machine:

```bash
git clone https://github.com/SuusjeVG/mediapipe-tracking.git
cd mediapipe-project
```

## Gebruik

Om het project te starten, open je de index.html bestanden in een van de mappen afhankelijk van het gewenste tracking onderdeel. Zorg ervoor dat je een lokale server draait vanwege de browserbeveiliging gerelateerd aan het laden van modellen.

Kies een van de trackingsbestanden uit die je wilt gebruiken. De rest van de mapjes kun je dan allemaal verwijderen.

## Licentie

Dit project is gelicenseerd onder de MIT License - zie de LICENSE file voor details.

## Specifieke Documentatie
Voor gedetailleerde informatie over elk onderdeel, bezoek de volgende links:

- [Global Documentation](./mediapipe-project/README.md)
- [Face Detection Documentation](./mediapipe-project/face/face.md)
- [Hand Pose Detection Documentation](./mediapipe-project/hands/hands.md)
- [Pose Estimation Documentation](./mediapipe-project/pose/pose.md)
- [Holistic Detection Documentation](./mediapipe-project/holistic/holistic.md)

We hopen dat dit project nuttig zal zijn voor je onderzoek en ontwikkeling in motion tracking technologieën. Veel succes!