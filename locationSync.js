
import { loadEnvFile } from "process";
import { initializeApp } from "firebase/app";


import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';
import { readFileSync } from 'fs';

loadEnvFile(".env");

const firebaseConfig = {
  apiKey:             process.env.VITE_FIREBASE_API_KEY,
  authDomain:         process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId:          process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket:      process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId:  process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId:              process.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const locations = JSON.parse(readFileSync('./locations.json', 'utf-8'));

function sortedStringify(obj) {
  const sortedKeys = Object.keys(obj).sort();
  const sortedObj = {};
  for (const key of sortedKeys) {
    sortedObj[key] = obj[key];
  }
  return JSON.stringify(sortedObj);
}

async function syncLocations() {

    let added = 0;
    let updated = 0;
    let skipped = 0;



    for (const location of locations) {
        const { id, ...data} = location;
        

        const ref = doc(db, 'locations', id);

        const snapshot = await getDoc(ref);

        if (!snapshot.exists()) {

            await setDoc(ref, {
                ...data,
                createdAt: new Date()
            });

            console.log(`Added new location: ${id}`);
            added++;
        }

        else {


            const existingData = snapshot.data();


            const{ createdAt, updatedAt, ...existingWithoutTimestamps} = existingData;
            const hasChanged = sortedStringify(data) !== sortedStringify(existingWithoutTimestamps);

            if (hasChanged) {
                await setDoc(ref, {
                    ...data,
                    createdAt: createdAt,
                    updatedAt: new Date()
                });
                console.log(`Updated existing location: ${id}`);
                updated++;
            } else {
                console.log(`No changes for location: ${id}, skipping update.`);
                skipped++;
            }
        }
    }

    console.log(`\n--- Sync complete ---`);
    console.log(`✅ Added:   ${added}`);
    console.log(`🔄 Updated: ${updated}`);
    console.log(`⏭️  Skipped: ${skipped}`);
}

syncLocations().catch(console.error);