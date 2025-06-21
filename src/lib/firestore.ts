import {
  doc,
  setDoc,
  getDoc,
  getDocs,
  collection,
  query,
  orderBy,
  limit,
  serverTimestamp,
  runTransaction,
} from 'firebase/firestore';
import type { User } from 'firebase/auth';
import { db } from './firebase';

export interface UserProfile {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
  createdAt: any;
  quizCount: number;
  totalScore: number;
  averageRating: number;
}

export async function getOrCreateUserProfile(user: User): Promise<UserProfile> {
  const userRef = doc(db, 'users', user.uid);
  const userSnap = await getDoc(userRef);

  if (userSnap.exists()) {
    return userSnap.data() as UserProfile;
  } else {
    const newUserProfile: UserProfile = {
      uid: user.uid,
      displayName: user.displayName,
      email: user.email,
      photoURL: user.photoURL,
      createdAt: serverTimestamp(),
      quizCount: 0,
      totalScore: 0,
      averageRating: 0,
    };
    await setDoc(userRef, newUserProfile);
    return newUserProfile;
  }
}

export async function updateUserQuizStats(uid: string, newScore: number) {
  const userRef = doc(db, 'users', uid);
  try {
    await runTransaction(db, async (transaction) => {
      const userDoc = await transaction.get(userRef);
      if (!userDoc.exists()) {
        throw "Document does not exist!";
      }

      const data = userDoc.data() as UserProfile;
      const newQuizCount = (data.quizCount || 0) + 1;
      const newTotalScore = (data.totalScore || 0) + newScore;
      const newAverageRating = newTotalScore / newQuizCount;
      
      transaction.update(userRef, { 
        quizCount: newQuizCount,
        totalScore: newTotalScore,
        averageRating: newAverageRating
      });
    });
  } catch (e) {
    console.error("Transaction failed: ", e);
  }
}


export async function getUserProfile(uid: string): Promise<UserProfile | null> {
    const userRef = doc(db, 'users', uid);
    const userSnap = await getDoc(userRef);
    return userSnap.exists() ? (userSnap.data() as UserProfile) : null;
}

export async function getLeaderboard(): Promise<UserProfile[]> {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, orderBy('averageRating', 'desc'), limit(100));
    const querySnapshot = await getDocs(q);
    const leaderboard: UserProfile[] = [];
    querySnapshot.forEach((doc) => {
        leaderboard.push(doc.data() as UserProfile);
    });
    return leaderboard;
}
