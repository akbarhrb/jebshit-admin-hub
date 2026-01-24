import { useState, useEffect, useCallback } from 'react';
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  Timestamp,
  QueryConstraint,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface FirestoreDocument {
  id: string;
  createdAt: string;
  updatedAt: string;
}

interface UseFirestoreOptions {
  orderByField?: string;
  orderDirection?: 'asc' | 'desc';
}

export function useFirestore<T extends FirestoreDocument>(
  collectionName: string,
  options: UseFirestoreOptions = {}
) {
  const [data, setData] = useState<T[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { orderByField = 'createdAt', orderDirection = 'desc' } = options;

  useEffect(() => {
    setIsLoading(true);
    setError(null);

    const constraints: QueryConstraint[] = [orderBy(orderByField, orderDirection)];
    const q = query(collection(db, collectionName), ...constraints);

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const items: T[] = snapshot.docs.map((doc) => {
          const docData = doc.data();
          return {
            ...docData,
            id: doc.id,
            createdAt: docData.createdAt?.toDate?.()?.toISOString() || docData.createdAt,
            updatedAt: docData.updatedAt?.toDate?.()?.toISOString() || docData.updatedAt,
          } as T;
        });
        setData(items);
        setIsLoading(false);
      },
      (err) => {
        console.error('Firestore error:', err);
        setError(err.message);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [collectionName, orderByField, orderDirection]);

  const add = useCallback(
    async (item: Omit<T, 'id' | 'createdAt' | 'updatedAt'>) => {
      const now = Timestamp.now();
      const docRef = await addDoc(collection(db, collectionName), {
        ...item,
        createdAt: now,
        updatedAt: now,
      });
      return docRef.id;
    },
    [collectionName]
  );

  const update = useCallback(
    async (id: string, updates: Partial<Omit<T, 'id' | 'createdAt'>>) => {
      const docRef = doc(db, collectionName, id);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: Timestamp.now(),
      });
    },
    [collectionName]
  );

  const remove = useCallback(
    async (id: string) => {
      const docRef = doc(db, collectionName, id);
      await deleteDoc(docRef);
    },
    [collectionName]
  );

  return {
    data,
    isLoading,
    error,
    add,
    update,
    remove,
  };
}
