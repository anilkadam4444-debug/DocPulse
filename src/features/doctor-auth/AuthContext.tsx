import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import {
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendEmailVerification,
  sendPasswordResetEmail,
  updateProfile,
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db, handleFirestoreError, OperationType } from '../../lib/firebase';
import { AuthContextType, DoctorTenantProfile } from '../../types/auth';
import { getFriendlyAuthErrorMessage } from './auth-errors';
import { publishDoctorProfile } from '../doctor-search/searchService';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface PendingProfileCreation {
  uid: string;
  payload: Record<string, unknown>;
}

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [doctorProfile, setDoctorProfile] = useState<DoctorTenantProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isProfileLoading, setIsProfileLoading] = useState<boolean>(false);
  const [pendingProfile, setPendingProfile] = useState<PendingProfileCreation | null>(null);

  const fetchDoctorProfile = useCallback(async (uid: string): Promise<DoctorTenantProfile | null> => {
    setIsProfileLoading(true);
    try {
      const docRef = doc(db, 'doctors', uid);
      const snapshot = await getDoc(docRef);
      if (snapshot.exists()) {
        const data = snapshot.data() as DoctorTenantProfile;
        setDoctorProfile(data);
        return data;
      }
      setDoctorProfile(null);
      return null;
    } catch (err) {
      console.error('Error fetching doctor profile:', err);
      return null;
    } finally {
      setIsProfileLoading(false);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        await fetchDoctorProfile(currentUser.uid);
      } else {
        setDoctorProfile(null);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [fetchDoctorProfile]);

  const login = async (email: string, pass: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email.trim(), pass);
      await fetchDoctorProfile(userCredential.user.uid);
      return { success: true };
    } catch (err: unknown) {
      const rawMsg = err instanceof Error ? err.message : String(err);
      return { success: false, error: getFriendlyAuthErrorMessage(rawMsg) };
    }
  };

  const logout = async () => {
    await signOut(auth);
    setDoctorProfile(null);
    setPendingProfile(null);
  };

  const registerDoctorAccount: AuthContextType['registerDoctorAccount'] = async (
    accountData,
    professionalData,
    clinicData,
    scheduleData
  ) => {
    try {
      // 1. Calculate duration
      const duration = scheduleData.isCustomDuration
        ? parseInt(scheduleData.customDurationMinutes || '15', 10) || 15
        : scheduleData.avgDurationMinutes || 15;

      let registeredUser = auth.currentUser;

      // 2. Create Auth Account if not already logged in with this email
      if (!registeredUser || registeredUser.email?.toLowerCase() !== accountData.email.trim().toLowerCase()) {
        const credential = await createUserWithEmailAndPassword(
          auth,
          accountData.email.trim(),
          accountData.password
        );
        registeredUser = credential.user;

        // Set display name
        try {
          await updateProfile(registeredUser, {
            displayName: accountData.fullName.trim(),
          });
        } catch (nameErr) {
          console.warn('Could not set displayName on auth user:', nameErr);
        }

        // Send email verification
        try {
          await sendEmailVerification(registeredUser);
        } catch (verifErr) {
          console.warn('Could not send initial email verification:', verifErr);
        }
      }

      const uid = registeredUser.uid;

      // 3. Build doctor profile document (NO passwords stored!)
      const profileDoc: Record<string, unknown> = {
        uid,
        tenantId: uid,
        fullName: accountData.fullName.trim(),
        email: accountData.email.trim().toLowerCase(),
        mobile: accountData.mobile.replace(/\D/g, ''),
        qualifications: professionalData.qualifications.trim(),
        specialization: professionalData.specialization.trim(),
        registrationCouncil: professionalData.registrationCouncil.trim(),
        registrationNumber: professionalData.registrationNumber.trim(),
        languages: professionalData.languages.join(', '),
        clinicName: clinicData.clinicName.trim(),
        practiceType: clinicData.practiceType,
        city: clinicData.city.trim(),
        state: clinicData.state.trim(),
        locality: clinicData.locality.trim(),
        addressLine: clinicData.addressLine.trim(),
        pincode: clinicData.pincode.replace(/\D/g, ''),
        consultationFee: clinicData.consultationFee.trim(),
        avgDurationMinutes: duration,
        role: 'doctor_owner',
        credentialsVerified: false, // Explicitly false: council credentials require administrative verification
        emailVerified: registeredUser.emailVerified,
        createdAt: serverTimestamp(),
      };

      if (professionalData.customSpecialization) {
        profileDoc.customSpecialization = professionalData.customSpecialization.trim();
      }
      if (professionalData.experienceYears) {
        profileDoc.experienceYears = professionalData.experienceYears.trim();
      }
      if (professionalData.bio) {
        profileDoc.bio = professionalData.bio.trim();
      }
      if (clinicData.landmark) {
        profileDoc.landmark = clinicData.landmark.trim();
      }
      if (clinicData.followUpFee) {
        profileDoc.followUpFee = clinicData.followUpFee.trim();
      }
      if (clinicData.followUpDays) {
        profileDoc.followUpDays = clinicData.followUpDays;
      }
      if (clinicData.clinicPhone) {
        profileDoc.clinicPhone = clinicData.clinicPhone.trim();
      }

      profileDoc.schedule = {
        avgDurationMinutes: duration,
        workingDays: scheduleData.workingDays,
        session1: scheduleData.session1,
        hasSession2: scheduleData.hasSession2,
        ...(scheduleData.session2 ? { session2: scheduleData.session2 } : {}),
        acceptsWalkIns: scheduleData.acceptsWalkIns,
      };

      profileDoc.locations = [
        {
          id: `loc_${Date.now()}`,
          name: clinicData.clinicName.trim(),
          practiceType: clinicData.practiceType,
          addressLine: clinicData.addressLine.trim(),
          locality: clinicData.locality.trim(),
          landmark: clinicData.landmark?.trim() || '',
          city: clinicData.city.trim(),
          state: clinicData.state.trim(),
          pincode: clinicData.pincode.replace(/\D/g, ''),
          phone: clinicData.clinicPhone?.trim() || '',
          consultationFee: clinicData.consultationFee.trim(),
          facilities: ['Reception OPD Desk', 'Digital Queue Stand'],
          isPrimary: true,
          isActive: true,
          createdAt: new Date().toISOString(),
        },
      ];

      profileDoc.consultationSettings = {
        defaultFee: clinicData.consultationFee.trim(),
        followUpFee: clinicData.followUpFee?.trim() || '0',
        followUpDays: clinicData.followUpDays || 7,
        avgDurationMinutes: duration,
        inPersonEnabled: true,
        videoConsultationEnabled: false,
        emergencyReserveSlots: 2,
      };

      profileDoc.bookingPreferences = {
        dailyTokenLimit: 30,
        walkInQREnabled: scheduleData.acceptsWalkIns ?? true,
        whatsAppAlertThreshold: 3,
        advanceBookingDays: 7,
        cancellationNoticeHours: 2,
        autoConfirmOnline: true,
      };

      // Store in memory for retry if write fails
      setPendingProfile({ uid, payload: profileDoc });

      // 4. Save to Firestore doctors/{uid}
      try {
        await setDoc(doc(db, 'doctors', uid), profileDoc);
        setPendingProfile(null);
        const savedProfile = await fetchDoctorProfile(uid);

        // Auto-publish to public discovery directory
        if (savedProfile) {
          try {
            await publishDoctorProfile(uid, savedProfile, 'published');
          } catch (pubErr) {
            console.warn('Silent public profile listing sync warning on registration:', pubErr);
          }
        }

        return { success: true };
      } catch (firestoreError) {
        handleFirestoreError(firestoreError, OperationType.WRITE, `doctors/${uid}`);
        return {
          success: false,
          error:
            'Your login account was created, but saving the clinic profile encountered an error. Click "Retry Saving Profile" to continue without creating a duplicate account.',
          canRetryProfile: true,
        };
      }
    } catch (authError: unknown) {
      const rawMsg = authError instanceof Error ? authError.message : String(authError);
      return { success: false, error: getFriendlyAuthErrorMessage(rawMsg) };
    }
  };

  const retryCreateProfile = async (): Promise<{ success: boolean; error?: string }> => {
    if (!pendingProfile || !auth.currentUser) {
      return { success: false, error: 'No pending profile found to retry.' };
    }
    try {
      await setDoc(doc(db, 'doctors', pendingProfile.uid), pendingProfile.payload);
      setPendingProfile(null);
      const savedProfile = await fetchDoctorProfile(pendingProfile.uid);
      if (savedProfile) {
        try {
          await publishDoctorProfile(pendingProfile.uid, savedProfile, 'published');
        } catch (pubErr) {
          console.warn('Silent public profile listing sync warning on retry:', pubErr);
        }
      }
      return { success: true };
    } catch (err: unknown) {
      const rawMsg = err instanceof Error ? err.message : String(err);
      return { success: false, error: getFriendlyAuthErrorMessage(rawMsg) };
    }
  };

  const updateDoctorProfile = async (
    updates: Partial<DoctorTenantProfile>
  ): Promise<{ success: boolean; error?: string }> => {
    if (!auth.currentUser) {
      return { success: false, error: 'Doctor not authenticated.' };
    }
    const uid = auth.currentUser.uid;
    try {
      const docRef = doc(db, 'doctors', uid);

      // Sanitize payload to respect immutable security fields
      const safeUpdates: Record<string, unknown> = {
        ...updates,
        updatedAt: serverTimestamp(),
      };

      // Protect immutables from client alteration
      delete safeUpdates.uid;
      delete safeUpdates.tenantId;
      delete safeUpdates.createdAt;
      delete safeUpdates.role;
      delete safeUpdates.credentialsVerified;

      // Keep email verified status synchronized with Firebase Auth
      safeUpdates.emailVerified = auth.currentUser.emailVerified;

      await setDoc(docRef, safeUpdates, { merge: true });
      const updatedProfile = await fetchDoctorProfile(uid);

      // Auto-sync updated public directory listing
      if (updatedProfile) {
        try {
          await publishDoctorProfile(uid, updatedProfile, 'published');
        } catch (pubErr) {
          console.warn('Silent public profile listing sync warning on update:', pubErr);
        }
      }

      return { success: true };
    } catch (err: unknown) {
      const rawMsg = err instanceof Error ? err.message : String(err);
      console.error('Error updating doctor profile:', rawMsg);
      return { success: false, error: getFriendlyAuthErrorMessage(rawMsg) };
    }
  };

  const refreshProfile = async () => {
    if (auth.currentUser) {
      await fetchDoctorProfile(auth.currentUser.uid);
    }
  };

  const sendPasswordReset = async (email: string): Promise<{ success: boolean; error?: string }> => {
    try {
      await sendPasswordResetEmail(auth, email.trim());
      return { success: true };
    } catch (err: unknown) {
      const rawMsg = err instanceof Error ? err.message : String(err);
      return { success: false, error: getFriendlyAuthErrorMessage(rawMsg) };
    }
  };

  const resendVerificationEmail = async (): Promise<{ success: boolean; error?: string }> => {
    if (!auth.currentUser) {
      return { success: false, error: 'You must be signed in to send verification email.' };
    }
    try {
      await sendEmailVerification(auth.currentUser);
      return { success: true };
    } catch (err: unknown) {
      const rawMsg = err instanceof Error ? err.message : String(err);
      return { success: false, error: getFriendlyAuthErrorMessage(rawMsg) };
    }
  };

  const reloadUserStatus = async () => {
    if (auth.currentUser) {
      await auth.currentUser.reload();
      setUser({ ...auth.currentUser });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        doctorProfile,
        isLoading,
        isProfileLoading,
        login,
        logout,
        registerDoctorAccount,
        retryCreateProfile,
        updateDoctorProfile,
        refreshProfile,
        sendPasswordReset,
        resendVerificationEmail,
        reloadUserStatus,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
