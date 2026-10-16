import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, getDocs, setDoc } from 'firebase/firestore';
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
const db = getFirestore(app, env.VITE_FIREBASE_FIRESTORE_DATABASE_ID);

function generateSearchTokens(...strings) {
  const tokenSet = new Set();
  for (const str of strings) {
    if (!str) continue;
    const words = str
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter((w) => w.length >= 2);
    for (const w of words) {
      tokenSet.add(w);
    }
  }
  return Array.from(tokenSet);
}

async function syncAllDoctorsToPublic() {
  console.log('Reading all doctors from collection "doctors"...');
  const snap = await getDocs(collection(db, 'doctors'));
  console.log(`Found ${snap.size} doctors in "doctors" collection.`);

  for (const docSnap of snap.docs) {
    const data = docSnap.data();
    const doctorUid = docSnap.id;
    console.log(`Syncing doctor ${doctorUid} (${data.fullName})...`);

    const rawLocations = data.locations || [];
    let publicLocations = rawLocations.map((loc) => ({
      id: loc.id || `loc_${Date.now()}`,
      name: loc.name || loc.clinicName || data.clinicName || 'Clinic Location',
      practiceType: loc.practiceType || data.practiceType || 'independent_clinic',
      addressLine: loc.addressLine || data.addressLine || '',
      locality: loc.locality || data.locality || '',
      landmark: loc.landmark || data.landmark || '',
      city: loc.city || data.city || 'Mumbai',
      state: loc.state || data.state || 'Maharashtra',
      pincode: loc.pincode || data.pincode || '',
      phone: loc.phone || data.clinicPhone || '',
      consultationFee: loc.consultationFee || data.consultationFee || '500',
      facilities: loc.facilities || ['Reception OPD Desk', 'Digital Queue Stand'],
      isPrimary: Boolean(loc.isPrimary),
      isActive: loc.isActive ?? true,
    }));

    if (publicLocations.length === 0) {
      publicLocations = [
        {
          id: `loc_${Date.now()}`,
          name: data.clinicName || 'Clinic Location',
          practiceType: data.practiceType || 'independent_clinic',
          addressLine: data.addressLine || '',
          locality: data.locality || '',
          landmark: data.landmark || '',
          city: data.city || 'Mumbai',
          state: data.state || 'Maharashtra',
          pincode: data.pincode || '',
          phone: data.clinicPhone || '',
          consultationFee: data.consultationFee || '500',
          facilities: ['Reception OPD Desk', 'Digital Queue Stand'],
          isPrimary: true,
          isActive: true,
        },
      ];
    }

    const primaryLoc = publicLocations.find((l) => l.isPrimary) || publicLocations[0];

    const citiesSet = new Set();
    if (data.city) {
      citiesSet.add(data.city);
      citiesSet.add(data.city.toLowerCase());
    }
    for (const loc of publicLocations) {
      if (loc.isActive && loc.city) {
        citiesSet.add(loc.city);
        citiesSet.add(loc.city.toLowerCase());
      }
    }
    const cities = Array.from(citiesSet);

    let parsedLanguages = ['English', 'Hindi'];
    if (Array.isArray(data.languages)) {
      parsedLanguages = data.languages;
    } else if (typeof data.languages === 'string') {
      parsedLanguages = data.languages.split(',').map((l) => l.trim()).filter(Boolean);
    }

    const searchTokens = generateSearchTokens(
      data.fullName,
      data.specialization,
      data.customSpecialization,
      data.qualifications,
      data.city,
      primaryLoc?.name,
      primaryLoc?.locality,
      ...publicLocations.map((l) => l.name),
      ...publicLocations.map((l) => l.city)
    );

    const publicProfile = {
      doctorUid,
      fullName: (data.fullName || 'Registered Doctor').trim(),
      specialization: (data.specialization || 'General Medicine').trim(),
      customSpecialization: (data.customSpecialization || '').trim(),
      qualifications: (data.qualifications || 'MBBS').trim(),
      experienceYears: String(data.experienceYears || '').trim(),
      languages: parsedLanguages,
      bio: (data.bio || '').trim(),
      registrationCouncil: (data.registrationCouncil || 'State Medical Council').trim(),
      registrationNumber: (data.registrationNumber || '').trim(),
      credentialsVerified: Boolean(data.credentialsVerified),
      status: 'published',
      city: primaryLoc?.city || data.city || 'Mumbai',
      cities,
      primaryClinicName: primaryLoc?.name || data.clinicName || 'Moraya Clinic',
      primaryAddress: primaryLoc?.addressLine || data.addressLine || '',
      primaryLocality: primaryLoc?.locality || data.locality || '',
      primaryPincode: primaryLoc?.pincode || data.pincode || '',
      consultationFee: String(
        data.consultationSettings?.defaultFee || data.consultationFee || '500'
      ),
      followUpFee: String(
        data.consultationSettings?.followUpFee || data.followUpFee || '0'
      ),
      followUpDays: Number(
        data.consultationSettings?.followUpDays || data.followUpDays || 7
      ),
      avgDurationMinutes: Number(
        data.consultationSettings?.avgDurationMinutes || data.avgDurationMinutes || 15
      ),
      locations: publicLocations,
      schedule: {
        workingDays: data.schedule?.workingDays || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
        session1: data.schedule?.session1 || {
          openTime: '09:00',
          closeTime: '13:00',
          hasBreak: false,
        },
        hasSession2: Boolean(data.schedule?.hasSession2),
        ...(data.schedule?.session2 ? { session2: data.schedule.session2 } : {}),
        acceptsWalkIns: data.schedule?.acceptsWalkIns ?? true,
      },
      bookingPreferences: {
        walkInQREnabled: data.bookingPreferences?.walkInQREnabled ?? true,
        advanceBookingDays: data.bookingPreferences?.advanceBookingDays || 7,
        onlineBookingEnabled: data.bookingPreferences?.onlineBookingEnabled ?? true,
      },
      searchKeywords: searchTokens,
      publishedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const targetDocRef = doc(db, 'publicDoctors', doctorUid);
    await setDoc(targetDocRef, publicProfile);
    console.log(`Successfully published publicDoctors/${doctorUid}!`);
  }

  // Verify
  const pubSnap = await getDocs(collection(db, 'publicDoctors'));
  console.log(`\nVerification: publicDoctors count is now ${pubSnap.size}`);
  pubSnap.forEach((d) => {
    const docData = d.data();
    console.log(`- Doctor: ${docData.fullName} | ${docData.specialization} | ${docData.city} | Fee: ₹${docData.consultationFee} | Status: ${docData.status}`);
  });

  process.exit(0);
}

syncAllDoctorsToPublic().catch((err) => {
  console.error('Migration sync failed:', err);
  process.exit(1);
});
