import { Timestamp } from 'firebase/firestore';

/**
 * Converts a date string (YYYY-MM-DD) or Date object to a Firebase Timestamp
 * @param date - Date string in YYYY-MM-DD format, Date object, or undefined
 * @returns Timestamp or null if conversion fails or date is empty
 */
export function toFirestoreTimestamp(date: string | Date | undefined | null): Timestamp | null {
  if (!date) return null;
  
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    // Validate the date is valid
    if (isNaN(dateObj.getTime())) {
      console.error('Invalid date for Timestamp conversion:', date);
      return null;
    }
    
    return Timestamp.fromDate(dateObj);
  } catch (error) {
    console.error('Error converting date to Timestamp:', error);
    return null;
  }
}

/**
 * Converts a Firebase Timestamp to a date string (YYYY-MM-DD)
 * @param timestamp - Firestore Timestamp or any value
 * @returns Date string in YYYY-MM-DD format, or empty string if conversion fails
 */
export function fromFirestoreTimestamp(timestamp: Timestamp | string | null | undefined): string {
  if (!timestamp) return '';
  
  try {
    // Already a string (ISO format or date string)
    if (typeof timestamp === 'string') {
      const dateObj = new Date(timestamp);
      if (!isNaN(dateObj.getTime())) {
        return dateObj.toISOString().split('T')[0];
      }
      return timestamp;
    }
    
    // Firebase Timestamp
    if (timestamp && typeof timestamp === 'object' && 'toDate' in timestamp) {
      return (timestamp as Timestamp).toDate().toISOString().split('T')[0];
    }
    
    return '';
  } catch (error) {
    console.error('Error converting Timestamp to date:', error);
    return '';
  }
}

/**
 * Converts a Firebase Timestamp to a full ISO string for display
 * @param timestamp - Firestore Timestamp or any value
 * @returns ISO date string or the original value
 */
export function timestampToISO(timestamp: Timestamp | string | null | undefined): string {
  if (!timestamp) return '';
  
  try {
    if (typeof timestamp === 'string') {
      return timestamp;
    }
    
    if (timestamp && typeof timestamp === 'object' && 'toDate' in timestamp) {
      return (timestamp as Timestamp).toDate().toISOString();
    }
    
    return '';
  } catch (error) {
    console.error('Error converting Timestamp to ISO:', error);
    return '';
  }
}

/**
 * Validates that a date string can be converted to a valid Timestamp
 * @param date - Date string to validate
 * @returns true if valid, false otherwise
 */
export function isValidDateForTimestamp(date: string | undefined | null): boolean {
  if (!date) return false;
  
  const dateObj = new Date(date);
  return !isNaN(dateObj.getTime());
}
