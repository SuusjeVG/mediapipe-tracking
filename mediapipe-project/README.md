# MediaPipe Motion Tracking Project

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
git clone https://github.com/jouwgebruikersnaam/mediapipe-project.git
cd mediapipe-project