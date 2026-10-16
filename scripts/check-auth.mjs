import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, getDoc, collection, getDocs } from 'firebase/firestore';
import fs from 'fs';

const envContent = fs.readFileSync('.env', 'utf-8');
const env = Object.fromEntries(
  envContent
    .split('\n')
    .filter(Boolean)
    .map((line) => line.split('='))
    .map(([k, ...v]) => [k.trim(), v.join('=').trim()])
);

const config = {
  apiKey: env.VITE_FIREBASE_API_KEY,
  projectId: env.VITE_FIREBASE_PROJECT_ID,
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
};

const app = initializeApp(config);
const auth = getAuth(app);
const db = getFirestore(app, env.VITE_FIREBASE_FIRESTORE_DATABASE_ID);

console.log('Testing connection to DB:', env.VITE_FIREBASE_FIRESTORE_DATABASE_ID);
process.exit(0);
