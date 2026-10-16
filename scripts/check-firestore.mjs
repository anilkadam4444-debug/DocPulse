import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
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

async function checkDb(dbIdName, dbInstance) {
  console.log(`\n=== Checking DB: ${dbIdName} ===`);
  try {
    const docSnap = await getDocs(collection(dbInstance, 'doctors'));
    console.log(`doctors count: ${docSnap.size}`);
    docSnap.forEach((d) => console.log(`  DOCTOR [${d.id}]:`, JSON.stringify(d.data(), null, 2)));
  } catch (err) {
    console.log(`  Error querying doctors on ${dbIdName}:`, err.message);
  }

  try {
    const pubSnap = await getDocs(collection(dbInstance, 'publicDoctors'));
    console.log(`publicDoctors count: ${pubSnap.size}`);
    pubSnap.forEach((d) => console.log(`  PUBLIC DOCTOR [${d.id}]:`, JSON.stringify(d.data(), null, 2)));
  } catch (err) {
    console.log(`  Error querying publicDoctors on ${dbIdName}:`, err.message);
  }
}

async function run() {
  const customDbId = env.VITE_FIREBASE_FIRESTORE_DATABASE_ID;
  if (customDbId) {
    const dbCustom = getFirestore(app, customDbId);
    await checkDb(customDbId, dbCustom);
  }

  const dbDefault = getFirestore(app);
  await checkDb('(default)', dbDefault);

  process.exit(0);
}

run();
