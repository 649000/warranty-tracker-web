import { inject, Service } from '@angular/core';
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { DB } from '../firebase/firebase.providers';

@Service()
export class NotificationPreferenceService {
  private readonly db = inject(DB);

  async expiryEmailsEnabled(uid: string): Promise<boolean> {
    const snapshot = await getDoc(doc(this.db, 'users', uid, 'settings', 'notifications'));
    return snapshot.data()?.['expiryEmailsEnabled'] !== false;
  }

  async setExpiryEmailsEnabled(uid: string, enabled: boolean): Promise<void> {
    await setDoc(
      doc(this.db, 'users', uid, 'settings', 'notifications'),
      { expiryEmailsEnabled: enabled, updatedAt: serverTimestamp() },
      { merge: true },
    );
  }
}
