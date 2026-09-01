import { Timestamp } from 'firebase/firestore';

export function firestoreDate(value: unknown): Date | null {
  if (value instanceof Timestamp) {
    return value.toDate();
  }
  if (value instanceof Date) {
    return value;
  }
  return null;
}

export function optionalDate(value: unknown): Date | null {
  return firestoreDate(value);
}
