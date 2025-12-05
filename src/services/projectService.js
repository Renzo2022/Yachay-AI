import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  where,
  orderBy,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
} from 'firebase/firestore';
import { db } from '../config/firebase.js';

const projectsCollection = collection(db, 'projects');

export async function createProject(userId, projectData) {
  const payload = {
    title: projectData.title,
    description: projectData.description ?? '',
    status: projectData.status ?? 'active',
    currentPhase: projectData.currentPhase ?? 1,
    userId,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  const docRef = await addDoc(projectsCollection, payload);
  return docRef.id;
}

export async function getUserProjects(userId) {
  const q = query(projectsCollection, where('userId', '==', userId), orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }));
}

export async function deleteProject(projectId) {
  const projectRef = doc(db, 'projects', projectId);
  await deleteDoc(projectRef);
}

export async function updateProject(projectId, data) {
  const projectRef = doc(db, 'projects', projectId);
  await updateDoc(projectRef, {
    ...data,
    updatedAt: serverTimestamp(),
  });
}
