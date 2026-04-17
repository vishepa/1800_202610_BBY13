# TheShortCut

## Overview

TheShortCut uses real-time user location to suggest some establishment options within BC Place
Stadium, providing live distance tracking and crowd-level estimates to help fans find the locations
near them with low wait times.


Developed for the COMP 1800 course, this project applies User-Centred Design practices and agile project management, and demonstrates integration with Firebase backend services for storing user favorites.

---

## Features

- View a map of BC Place containing markers for points of interest
- View wait-times and distance from the user
- View the congestion page for a list view of all the locations nearby sorted from closest to furthest
- Confirm or Update the posted wait time for any location
- Sign in for a user tailored experience
- Search for locations from the navbar to quickly find your desired place
- Responsive design for desktop and mobile

---

## Technologies Used

- **Frontend**: HTML, CSS, JavaScript, MapLibre, Bootstrap
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Backend**: Firebase for hosting
- **Database**: Firestore

---

## Usage

To run the application locally:

1.  **Clone** the repository.
2.  **Install dependencies** by running `npm install` in the project root directory.
3.  **Start the development server** by running the command: `npm run dev`.
4.  Open your browser and visit the local address shown in your terminal (usually `http://localhost:5173` or similar).

Once the application is running:

1.  Browse the markers littered through the map on the home page.
2.  Click on a marker and confirm/update the posted wait time.
3.  View the congestion page and toggle the recents button to view your recently viewed locations.

---

## Project Structure

```
1800-202610_BBY13/
├── src/
│   ├── components/
│   │   ├── site-footer.js
│   │   └── site-footer.js
│   │
|   ├── js/
│   │   ├── account.js
│   │   ├── authentication.js
│   │   ├── BC_place.js
│   │   ├── BCIT_Map.js
│   │   ├── firebaseConfig.js
│   │   ├── loginSignup.js
│   │   ├── main.js
|   │   └── map.js
|   │
│   └── styles/
│       ├── account-styles.css
│       ├── BC_place.css 
│       ├── BCIT_map.css 
│       └── style.css
│
├── public/
│   ├── images/ 
│   └── favicon.ico 
├── account.html
├── congestion.html
├── index.html
├── login.html
├── locations.json
├── locationSync.js
├── package.json
├── README.md
```

---

## Contributors



---
- **Varshini** - BCIT CST Student with a passion for badminton and designing attractive websites. Fun fact: Loves playing board games.
- **Valerie** - BCIT CST Student that likes to go out, meet new people, learn new things and used to practice multiple sports.
- **Vish Epa** - BCIT CST Student with experience in game development and C#. Passionate to learn and improve as a programmer and general tech guy.
- **Xi yao** - BCIT CST Student with a passion for user-friendly applications solving daily activity problems.

---
 


## Acknowledgments

- Code snippets were adapted from resources such as [Stack Overflow](https://stackoverflow.com/) and COMP-1800 demos.
- Icons sourced from [FlatIcon](https://flaticon.com).

---

## Limitations and Future Work

### Limitations

- Uncertain user reliability for updating posted times.
- Accessibility features can be further improved.

### Future Work

- Further develop the account page for more relevant features.
- Add filtering and sorting options (e.g., by type, congestion, distance).
- Create a dark mode for better usability in low-light conditions.
- Create a score system to create "trusted" users.

---

## License

This project is licensed under the MIT License. See the LICENSE file for details.
