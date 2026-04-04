import { initializeApp } from "firebase/app";
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  collection,
  getDocs,
  deleteDoc,
  query,
  where,
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAH5BCC3WWXeYPdlCiZUw0t3itoa1X4bRQ",
  authDomain: "quran-86d85.firebaseapp.com",
  projectId: "quran-86d85",
  storageBucket: "quran-86d85.firebasestorage.app",
  messagingSenderId: "927776914383",
  appId: "1:927776914383:web:033f896eae063b2d81b0ba",
  measurementId: "G-2QZKYNQK8M",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Use a default user ID since we're not using auth
const DEFAULT_USER = "default_user";

export interface Bookmark {
  surah: number;
  ayah: number;
  surahName: string;
  createdAt: number;
}

export interface LastReadPosition {
  surah: number;
  ayah: number;
  surahName: string;
  updatedAt: number;
}

// Bookmarks
export const addBookmark = async (bookmark: Bookmark) => {
  const id = `${DEFAULT_USER}_${bookmark.surah}_${bookmark.ayah}`;
  await setDoc(doc(db, "bookmarks", id), {
    ...bookmark,
    userId: DEFAULT_USER,
  });
};

export const removeBookmark = async (surah: number, ayah: number) => {
  const id = `${DEFAULT_USER}_${surah}_${ayah}`;
  await deleteDoc(doc(db, "bookmarks", id));
};

export const getBookmarks = async (): Promise<Bookmark[]> => {
  const q = query(
    collection(db, "bookmarks"),
    where("userId", "==", DEFAULT_USER)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => d.data() as Bookmark);
};

export const isBookmarked = async (
  surah: number,
  ayah: number
): Promise<boolean> => {
  const id = `${DEFAULT_USER}_${surah}_${ayah}`;
  const snap = await getDoc(doc(db, "bookmarks", id));
  return snap.exists();
};

// Last read position
export const saveLastRead = async (position: LastReadPosition) => {
  await setDoc(doc(db, "lastRead", DEFAULT_USER), {
    ...position,
    userId: DEFAULT_USER,
  });
};

export const getLastRead = async (): Promise<LastReadPosition | null> => {
  const snap = await getDoc(doc(db, "lastRead", DEFAULT_USER));
  return snap.exists() ? (snap.data() as LastReadPosition) : null;
};
