import { inject, Service, signal } from '@angular/core';
import { collection, getDocs } from 'firebase/firestore';
import { DB } from '../firebase/firebase.providers';
import type { ClaimContact } from '../models/claim-contact.model';
import type { CoverageContact, CoverageSource } from '../models/warranty.model';
import { firestoreDate } from '../utils/firestore';
import { normalizeClaimKey } from '../utils/claim-key';
import { ErrorReportingService } from './error-reporting.service';

export { claimContactDocId, normalizeClaimKey } from '../utils/claim-key';

export type ClaimSuggestionStatus = 'user' | 'suggested' | 'none';

export interface ClaimSuggestion {
  /** Whether the displayed claim details come from the user, the directory, or nowhere. */
  status: ClaimSuggestionStatus;
  /** The matching directory entry, when one exists. */
  entry?: ClaimContact;
  /** The user's override, when present. */
  userContact?: CoverageContact;
}

@Service()
export class ClaimDirectoryService {
  private readonly db = inject(DB);
  private readonly errorReporting = inject(ErrorReportingService);

  /** The full curated directory, loaded once per session. */
  readonly entries = signal<ClaimContact[]>([]);
  /** True once the initial directory load has settled. */
  readonly loaded = signal(false);

  private loading: Promise<void> | null = null;

  /** Loads the directory once; subsequent calls reuse the same promise. */
  ensureLoaded(): Promise<void> {
    this.loading ??= this.load();
    return this.loading;
  }

  private async load(): Promise<void> {
    try {
      const snapshot = await getDocs(collection(this.db, 'claimContacts'));
      this.entries.set(snapshot.docs.map((d) => claimContactFromDoc(d.data())));
    } catch (error) {
      this.errorReporting.captureException(error, { operation: 'loadClaimDirectory' });
    } finally {
      this.loaded.set(true);
    }
  }

  /** Finds the directory entry for a coverage's source and product brand/retailer. */
  findEntry(
    source: CoverageSource,
    brand: string | undefined,
    retailer: string | undefined,
  ): ClaimContact | undefined {
    const lookupName = source === 'retailer' ? retailer : brand;
    if (!lookupName) {
      return undefined;
    }
    const key = normalizeClaimKey(lookupName);
    const entries = this.entries();
    const exact = entries.find(
      (entry) => entry.type === source && normalizeClaimKey(entry.name) === key,
    );
    if (exact) {
      return exact;
    }
    return entries.find(
      (entry) =>
        entry.type === source && entry.matchKeys.some((alias) => normalizeClaimKey(alias) === key),
    );
  }

  /** Resolves the suggested claim information for a coverage. */
  resolve(
    source: CoverageSource,
    brand: string | undefined,
    retailer: string | undefined,
    userContact: CoverageContact | undefined,
  ): ClaimSuggestion {
    const entry = this.findEntry(source, brand, retailer);
    if (userContact) {
      return { status: 'user', entry, userContact };
    }
    return entry ? { status: 'suggested', entry } : { status: 'none' };
  }
}

function claimContactFromDoc(data: Record<string, unknown>): ClaimContact {
  const str = (value: unknown): string | undefined =>
    typeof value === 'string' && value.length > 0 ? value : undefined;
  const strArray = (value: unknown): string[] | undefined =>
    Array.isArray(value) ? value.filter((v): v is string => typeof v === 'string') : undefined;
  return {
    type: (data['type'] as ClaimContact['type']) ?? 'other',
    name: typeof data['name'] === 'string' ? data['name'] : '',
    matchKeys: strArray(data['matchKeys']) ?? [],
    url: str(data['url']),
    hotline: str(data['hotline']),
    email: str(data['email']),
    claimSteps: strArray(data['claimSteps']),
    serviceCenterUrl: str(data['serviceCenterUrl']),
    registrationUrl: str(data['registrationUrl']),
    updatedAt: firestoreDate(data['updatedAt']) ?? undefined,
  };
}
