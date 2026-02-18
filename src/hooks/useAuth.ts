"use client";

import { useState, useEffect } from "react";
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut as firebaseSignOut,
  deleteUser,
  updateProfile as firebaseUpdateProfile,
  User as FirebaseUser,
} from "firebase/auth";
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  deleteDoc,
  collection,
  query,
  where,
  getDocs,
  Timestamp,
} from "firebase/firestore";
import { auth, googleProvider, db } from "@/lib/firebase";
import { useCourseStore } from "@/stores/courseStore";
import type { User } from "@/lib/types";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const setLanguage = useCourseStore((state) => state.setLanguage);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userData = await getOrCreateUser(firebaseUser);
          setUser(userData);
          // Sync language preference to store
          if (userData.language) {
            setLanguage(userData.language);
          }
        } catch (err) {
          console.error("Error creating user doc:", err);
          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email || "",
            displayName: firebaseUser.displayName || "",
            photoURL: firebaseUser.photoURL || "",
            createdAt: Timestamp.now(),
          });
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [setLanguage]);

  const signIn = async () => {
    setError(null);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err: unknown) {
      const firebaseError = err as { code?: string; message?: string };
      console.error("Sign in error:", firebaseError.code, firebaseError.message);

      if (firebaseError.code === "auth/popup-blocked") {
        setError("Popup was blocked. Allow popups for localhost in your browser.");
      } else if (firebaseError.code === "auth/popup-closed-by-user") {
        // User closed the popup, not an error
      } else {
        setError("Sign in failed. Please try again.");
      }
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      setUser(null);
    } catch (err) {
      console.error("Error signing out:", err);
    }
  };

  const updateProfile = async (displayName: string, photoURL: string) => {
    if (!user || !auth.currentUser) return;
    try {
      await firebaseUpdateProfile(auth.currentUser, { displayName, photoURL });
      await updateDoc(doc(db, "users", user.uid), { displayName, photoURL });
      setUser((prev) => prev ? { ...prev, displayName, photoURL } : prev);
    } catch (err) {
      console.error("Error updating profile:", err);
      throw err;
    }
  };

  const updateLanguage = async (language: "en" | "es") => {
    if (!user) return;
    try {
      await updateDoc(doc(db, "users", user.uid), { language });
      setUser((prev) => prev ? { ...prev, language } : prev);
      setLanguage(language);
    } catch (err) {
      console.error("Error updating language:", err);
      throw err;
    }
  };

  const deleteAccount = async () => {
    if (!user || !auth.currentUser) return;
    try {
      // Delete all courses and progress
      const coursesQuery = query(
        collection(db, "courses"),
        where("userId", "==", user.uid)
      );
      const coursesSnap = await getDocs(coursesQuery);
      for (const courseDoc of coursesSnap.docs) {
        await deleteDoc(courseDoc.ref);
        await deleteDoc(doc(db, "progress", `${user.uid}_${courseDoc.id}`));
      }
      // Delete user doc
      await deleteDoc(doc(db, "users", user.uid));
      // Delete Firebase Auth account
      await deleteUser(auth.currentUser);
      setUser(null);
    } catch (err: unknown) {
      const firebaseError = err as { code?: string };
      if (firebaseError.code === "auth/requires-recent-login") {
        throw new Error(
          "Please sign out and sign back in before deleting your account."
        );
      }
      console.error("Error deleting account:", err);
      throw err;
    }
  };

  return { user, loading, error, signIn, signOut, updateProfile, updateLanguage, deleteAccount };
}

async function getOrCreateUser(firebaseUser: FirebaseUser): Promise<User> {
  const userRef = doc(db, "users", firebaseUser.uid);
  const userSnap = await getDoc(userRef);

  if (userSnap.exists()) {
    return userSnap.data() as User;
  }

  const newUser: User = {
    uid: firebaseUser.uid,
    email: firebaseUser.email || "",
    displayName: firebaseUser.displayName || "",
    photoURL: firebaseUser.photoURL || "",
    createdAt: Timestamp.now(),
  };

  await setDoc(userRef, newUser);
  return newUser;
}
