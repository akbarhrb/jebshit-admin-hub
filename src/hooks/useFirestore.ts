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
import { fromFirestoreTimestamp, toFirestoreTimestamp, timestampToISO } from '@/lib/dateUtils';

interface FirestoreDocument {
  id: string;
  createdAt: string;
  updatedAt: string;
}

// Define date field names for each collection
const COLLECTION_DATE_FIELDS: Record<string, string[]> = {
  news: ['date'],
  martyrs: ['dateOfMartyrdom'],
  activities: ['date'],
  topics: ['publishDate'],
  stories: ['publishDate'],
  jobs: ['publishDate', 'expiryDate'],
  memories: ['memoryDate'],
};

interface UseFirestoreOptions {
  orderByField?: string;
  orderDirection?: 'asc' | 'desc';
}

/**
 * Converts Firestore Timestamp fields back to strings for UI consumption
 */
function convertTimestampsToStrings<T>(data: Record<string, unknown>, collectionName: string): T {
  const result = { ...data };
  const dateFields = COLLECTION_DATE_FIELDS[collectionName] || [];
  
  // Convert createdAt and updatedAt
  if (result.createdAt) {
    result.createdAt = timestampToISO(result.createdAt as Timestamp);
  }
  if (result.updatedAt) {
    result.updatedAt = timestampToISO(result.updatedAt as Timestamp);
  }
  
  // Convert collection-specific date fields
  dateFields.forEach((field) => {
    if (result[field]) {
      result[field] = fromFirestoreTimestamp(result[field] as Timestamp);
    }
  });
  
  return result as T;
}

/**
 * Converts string date fields to Firestore Timestamps before saving
 */
function convertStringsToTimestamps(
  data: Record<string, unknown>,
  collectionName: string
): Record<string, unknown> {
  const result = { ...data };
  const dateFields = COLLECTION_DATE_FIELDS[collectionName] || [];
  
  // Convert collection-specific date fields to Timestamps
  dateFields.forEach((field) => {
    if (result[field] !== undefined) {
      const timestamp = toFirestoreTimestamp(result[field] as string);
      if (timestamp) {
        result[field] = timestamp;
      } else if (result[field] === '' || result[field] === null) {
        // Remove empty date fields instead of saving null
        delete result[field];
      }
    }
  });
  
  return result;
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
        const items: T[] = snapshot.docs.map((docSnapshot) => {
          const docData = docSnapshot.data();
          return {
            ...convertTimestampsToStrings<T>(docData, collectionName),
            id: docSnapshot.id,
          };
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
      const convertedData = convertStringsToTimestamps(
        item as Record<string, unknown>,
        collectionName
      );
      
      const docRef = await addDoc(collection(db, collectionName), {
        ...convertedData,
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
      const convertedData = convertStringsToTimestamps(
        updates as Record<string, unknown>,
        collectionName
      );
      
      await updateDoc(docRef, {
        ...convertedData,
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
