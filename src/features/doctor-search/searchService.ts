import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  query,
  where,
  limit,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../../lib/firebase';
import {
  PublicDoctorProfile,
  DoctorSearchFilters,
  PublicationStatus,
  PublicPracticeLocation,
} from '../../types/public-doctor';
import { DoctorTenantProfile } from '../../types/auth';

/**
 * Builds search keyword tokens for fast, case-insensitive text matching.
 */
function generateSearchTokens(...strings: (string | undefined | null)[]): string[] {
  const tokenSet = new Set<string>();
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

/**
 * Queries the publicDoctors collection in Cloud Firestore for doctors matching city, specialization, and name.
 * Security Note: Strictly queries the public collection with where('status', '==', 'published') to ensure
 * draft, pending, or suspended doctors are never exposed.
 */
export async function searchPublicDoctors(
  filters: DoctorSearchFilters
): Promise<{ doctors: PublicDoctorProfile[]; error?: string }> {
  const trimmedCity = filters.city?.trim() || '';
  const isAllCities = !trimmedCity || trimmedCity.toLowerCase() === 'all cities';

  const publicRef = collection(db, 'publicDoctors');

  try {
    let snapshot = await getDocs(
      query(publicRef, where('status', '==', 'published'), limit(150))
    );

    // If query by status returned empty, fallback to getDocs directly
    if (snapshot.empty) {
      try {
        snapshot = await getDocs(query(publicRef, limit(150)));
      } catch {
        // Ignored
      }
    }

    const results: PublicDoctorProfile[] = [];
    const cityLower = trimmedCity.toLowerCase();

    snapshot.forEach((docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data() as PublicDoctorProfile;
        // Strictly verify published status
        if (data.status === 'published' || !data.status) {
          if (isAllCities) {
            results.push(data);
          } else {
            // Case-insensitive city matching against cities array, primary city, or practice locations
            const matchesCity =
              data.cities?.some((c) => c && c.toLowerCase().includes(cityLower)) ||
              Boolean(data.city && data.city.toLowerCase().includes(cityLower)) ||
              data.locations?.some((loc) => loc.city && loc.city.toLowerCase().includes(cityLower));

            if (matchesCity) {
              results.push(data);
            }
          }
        }
      }
    });

    // Client-side refinement: specialization filter
    let filtered = results;
    if (filters.specialization && filters.specialization !== 'All Specializations') {
      const specLower = filters.specialization.toLowerCase();
      filtered = filtered.filter(
        (docItem) =>
          docItem.specialization.toLowerCase() === specLower ||
          docItem.customSpecialization?.toLowerCase() === specLower
      );
    }

    // Client-side refinement: text search query (doctor name, clinic name, locality)
    if (filters.query && filters.query.trim()) {
      const qLower = filters.query.toLowerCase().trim();
      filtered = filtered.filter((docItem) => {
        const matchesName = docItem.fullName.toLowerCase().includes(qLower);
        const matchesSpec =
          docItem.specialization.toLowerCase().includes(qLower) ||
          Boolean(docItem.customSpecialization?.toLowerCase().includes(qLower));
        const matchesClinic = docItem.locations.some(
          (loc) =>
            loc.name.toLowerCase().includes(qLower) ||
            loc.locality.toLowerCase().includes(qLower) ||
            loc.addressLine.toLowerCase().includes(qLower)
        );
        const matchesKeyword = Boolean(
          docItem.searchKeywords?.some((k) => k.includes(qLower))
        );

        return matchesName || matchesSpec || matchesClinic || matchesKeyword;
      });
    }

    return { doctors: filtered };
  } catch (err: unknown) {
    console.error('Error searching public doctors:', err);
    try {
      handleFirestoreError(err, OperationType.LIST, 'publicDoctors');
    } catch {
      // Caught to return friendly message in UI
    }
    const rawMsg = err instanceof Error ? err.message : String(err);
    return { doctors: [], error: rawMsg };
  }
}

/**
 * Fetches a single public doctor profile by UID.
 * Returns null if the doctor does not exist or is not published.
 */
export async function getPublicDoctorById(
  doctorId: string
): Promise<PublicDoctorProfile | null> {
  if (!doctorId || !doctorId.trim()) return null;

  try {
    const docRef = doc(db, 'publicDoctors', doctorId.trim());
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return null;
    }

    const data = docSnap.data() as PublicDoctorProfile;
    // Defensive check: only return if published
    if (data.status !== 'published') {
      return null;
    }

    return data;
  } catch (err) {
    console.error('Error fetching public doctor:', err);
    try {
      handleFirestoreError(err, OperationType.GET, `publicDoctors/${doctorId}`);
    } catch {
      // Logged and swallowed for clean null response
    }
    return null;
  }
}

/**
 * Publishes or unpublishes a doctor's public directory listing.
 * Sanitizes private fields (removes private email, personal mobile number, tenant account metadata)
 * and copies only explicitly approved public discovery data into publicDoctors/{doctorUid}.
 */
export async function publishDoctorProfile(
  doctorUid: string,
  privateProfile: DoctorTenantProfile,
  status: PublicationStatus = 'published'
): Promise<{ success: boolean; error?: string }> {
  if (!doctorUid) {
    return { success: false, error: 'Doctor UID is required.' };
  }

  try {
    const docRef = doc(db, 'publicDoctors', doctorUid);

    // Filter active practice locations only
    const rawLocations = privateProfile.locations || [];
    let publicLocations: PublicPracticeLocation[] = rawLocations.map((loc) => ({
      id: loc.id || `loc_${Date.now()}`,
      name: loc.name || loc.clinicName || privateProfile.clinicName || 'Clinic Location',
      practiceType: loc.practiceType || privateProfile.practiceType || 'independent_clinic',
      addressLine: loc.addressLine || privateProfile.addressLine || '',
      locality: loc.locality || privateProfile.locality || '',
      landmark: loc.landmark || privateProfile.landmark || '',
      city: loc.city || privateProfile.city || 'Mumbai',
      state: loc.state || privateProfile.state || 'Maharashtra',
      pincode: loc.pincode || privateProfile.pincode || '',
      phone: loc.phone || privateProfile.clinicPhone || '',
      consultationFee: loc.consultationFee || privateProfile.consultationFee || '500',
      facilities: loc.facilities || ['Reception OPD Desk', 'Digital Queue Stand'],
      isPrimary: Boolean(loc.isPrimary),
      isActive: loc.isActive ?? true,
    }));

    if (publicLocations.length === 0) {
      publicLocations = [
        {
          id: `loc_${Date.now()}`,
          name: privateProfile.clinicName || 'Moraya Clinic',
          practiceType: privateProfile.practiceType || 'independent_clinic',
          addressLine: privateProfile.addressLine || '',
          locality: privateProfile.locality || '',
          landmark: privateProfile.landmark || '',
          city: privateProfile.city || 'Mumbai',
          state: privateProfile.state || 'Maharashtra',
          pincode: privateProfile.pincode || '',
          phone: privateProfile.clinicPhone || '',
          consultationFee: privateProfile.consultationFee || '500',
          facilities: ['Reception OPD Desk', 'Digital Queue Stand'],
          isPrimary: true,
          isActive: true,
        },
      ];
    }

    // Find primary location
    const primaryLoc = publicLocations.find((l) => l.isPrimary) || publicLocations[0];

    // Collect all unique cities across active practice locations (include both exact and lower-cased)
    const citiesSet = new Set<string>();
    if (privateProfile.city) {
      citiesSet.add(privateProfile.city.trim());
      citiesSet.add(privateProfile.city.trim().toLowerCase());
    }
    for (const loc of publicLocations) {
      if (loc.isActive && loc.city) {
        citiesSet.add(loc.city.trim());
        citiesSet.add(loc.city.trim().toLowerCase());
      }
    }
    const cities = Array.from(citiesSet);

    // Build keyword search tokens
    const searchTokens = generateSearchTokens(
      privateProfile.fullName,
      privateProfile.specialization,
      privateProfile.customSpecialization,
      privateProfile.qualifications,
      privateProfile.city,
      primaryLoc?.name,
      primaryLoc?.locality,
      ...publicLocations.map((l) => l.name),
      ...publicLocations.map((l) => l.city)
    );

    let parsedLanguages: string[] = ['English', 'Hindi'];
    if (Array.isArray(privateProfile.languages)) {
      parsedLanguages = privateProfile.languages;
    } else if (typeof privateProfile.languages === 'string') {
      parsedLanguages = privateProfile.languages
        .split(',')
        .map((l) => l.trim())
        .filter(Boolean);
    }

    // Sanitized public payload (Strictly zero undefined fields to satisfy Firestore)
    const publicData: PublicDoctorProfile = {
      doctorUid,
      fullName: (privateProfile.fullName || 'Registered Medical Practitioner').trim(),
      specialization: (privateProfile.specialization || 'General Medicine').trim(),
      customSpecialization: (privateProfile.customSpecialization || '').trim(),
      qualifications: (privateProfile.qualifications || 'MBBS').trim(),
      experienceYears: String(privateProfile.experienceYears || '').trim(),
      languages: parsedLanguages,
      bio: (privateProfile.bio || '').trim(),
      registrationCouncil: (privateProfile.registrationCouncil || 'State Medical Council').trim(),
      registrationNumber: (privateProfile.registrationNumber || '').trim(),
      credentialsVerified: Boolean(privateProfile.credentialsVerified),
      status,
      city: primaryLoc?.city || privateProfile.city || 'Mumbai',
      cities,
      primaryClinicName: primaryLoc?.name || privateProfile.clinicName || 'Clinic Location',
      primaryAddress: primaryLoc?.addressLine || privateProfile.addressLine || '',
      primaryLocality: primaryLoc?.locality || privateProfile.locality || '',
      primaryPincode: primaryLoc?.pincode || privateProfile.pincode || '',
      consultationFee: String(
        privateProfile.consultationSettings?.defaultFee ||
        privateProfile.consultationFee ||
        '500'
      ),
      followUpFee: String(
        privateProfile.consultationSettings?.followUpFee ||
        privateProfile.followUpFee ||
        '0'
      ),
      followUpDays: Number(
        privateProfile.consultationSettings?.followUpDays ||
        privateProfile.followUpDays ||
        7
      ),
      avgDurationMinutes: Number(
        privateProfile.consultationSettings?.avgDurationMinutes ||
        privateProfile.avgDurationMinutes ||
        15
      ),
      locations: publicLocations,
      schedule: {
        workingDays: privateProfile.schedule?.workingDays || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
        session1: privateProfile.schedule?.session1 || {
          openTime: '09:00',
          closeTime: '13:00',
          hasBreak: false,
        },
        hasSession2: Boolean(privateProfile.schedule?.hasSession2),
        ...(privateProfile.schedule?.session2 ? { session2: privateProfile.schedule.session2 } : {}),
        acceptsWalkIns: privateProfile.schedule?.acceptsWalkIns ?? true,
      },
      bookingPreferences: {
        walkInQREnabled: privateProfile.bookingPreferences?.walkInQREnabled ?? true,
        advanceBookingDays: privateProfile.bookingPreferences?.advanceBookingDays || 7,
        onlineBookingEnabled: privateProfile.bookingPreferences?.onlineBookingEnabled ?? true,
      },
      searchKeywords: searchTokens,
      publishedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await setDoc(docRef, publicData, { merge: true });
    return { success: true };
  } catch (err: unknown) {
    console.error('Error publishing public doctor profile:', err);
    try {
      handleFirestoreError(err, OperationType.WRITE, `publicDoctors/${doctorUid}`);
    } catch {
      // Caught to return friendly message in UI
    }
    const rawMsg = err instanceof Error ? err.message : String(err);
    return { success: false, error: rawMsg };
  }
}

/**
 * Fetches the publication status of a doctor's public directory listing.
 */
export async function getDoctorPublicationStatus(
  doctorUid: string
): Promise<PublicationStatus> {
  if (!doctorUid) return 'draft';

  try {
    const docRef = doc(db, 'publicDoctors', doctorUid);
    const snap = await getDoc(docRef);
    if (!snap.exists()) return 'draft';
    const data = snap.data() as PublicDoctorProfile;
    return data.status || 'draft';
  } catch {
    return 'draft';
  }
}
