/**
 * Curated, plain-language guidance on what consumer warranties typically cover.
 *
 * This is generic information, not a plan-specific guarantee. It is intentionally
 * static and bundled (no backend reads) and is read through a single accessor so a
 * future shared warranty-terms directory can enrich it without changing the UI.
 */

export type GuidanceVerdict = 'covered' | 'excluded' | 'varies';

export interface CoverageScenario {
  id: string;
  label: string;
  verdict: GuidanceVerdict;
  explanation: string;
}

export interface CategoryGuidance {
  category: string;
  note: string;
}

export interface CoverageGuidance {
  scenarios: CoverageScenario[];
  baseline: string;
  categoryNote?: string;
  termsUrl?: string;
  disclaimer: string;
}

export const COVERAGE_SCENARIOS: CoverageScenario[] = [
  {
    id: 'manufacturing-defect',
    label: 'Manufacturing Defect',
    verdict: 'covered',
    explanation:
      'A fault present from manufacture and not caused by misuse is typically repaired or replaced.',
  },
  {
    id: 'accidental-damage',
    label: 'Accidental Damage',
    verdict: 'excluded',
    explanation:
      'Drops, cracks, and spills are usually excluded unless an accidental-damage plan is added.',
  },
  {
    id: 'liquid-damage',
    label: 'Liquid Damage',
    verdict: 'excluded',
    explanation:
      'Water or liquid ingress is normally excluded, even when a device is marketed as water-resistant.',
  },
  {
    id: 'wear-and-tear',
    label: 'Wear and Tear',
    verdict: 'varies',
    explanation:
      'Consumables and gradual wear are often excluded, though some brands cover batteries below a capacity threshold.',
  },
  {
    id: 'cosmetic-damage',
    label: 'Cosmetic Damage',
    verdict: 'excluded',
    explanation:
      'Scratches, dents, and marks that do not affect how the product works are usually not covered.',
  },
  {
    id: 'unauthorized-repair',
    label: 'Unauthorized Repair',
    verdict: 'excluded',
    explanation: 'Repairs or parts from an unauthorized provider can void the remaining warranty.',
  },
  {
    id: 'theft-loss',
    label: 'Theft or Loss',
    verdict: 'excluded',
    explanation:
      'Warranties cover faults, not theft or loss; those usually need separate insurance.',
  },
];

export const SG_STATUTORY_BASELINE =
  'In Singapore, consumer law gives you baseline rights independent of any manufacturer warranty: goods must be fit for purpose and match their description, and these rights can apply even after a manufacturer warranty ends.';

export const GUIDANCE_DISCLAIMER =
  "General guidance only. It describes what warranties commonly cover and is not a guarantee of your specific coverage. Always check your provider's official terms.";

export const CATEGORY_GUIDANCE: CategoryGuidance[] = [
  {
    category: 'Phones & Tablets',
    note: 'Battery capacity and screen faults are the most common claims; check the battery coverage threshold.',
  },
  {
    category: 'Computers',
    note: 'Battery and display faults are common; accidental and liquid damage are usually excluded.',
  },
  {
    category: 'Appliances',
    note: 'Motors and compressors are often covered for longer than the standard period; labour may be limited.',
  },
  {
    category: 'TVs & Monitors',
    note: 'Panel faults such as dead pixels may need to meet a minimum threshold before they count as a defect.',
  },
  {
    category: 'Audio',
    note: 'Battery degradation and ear-tip or cable wear are usually treated as consumables.',
  },
  {
    category: 'Cameras',
    note: 'Sensor and lens faults are typically covered; impact and water damage are usually excluded.',
  },
  {
    category: 'Wearables',
    note: 'Battery capacity and strap or band wear are common; water damage is often excluded.',
  },
];

/** The category-specific note for a product category, if one is curated. */
export function categoryGuidance(category: string | null | undefined): string | undefined {
  if (!category) {
    return undefined;
  }
  return CATEGORY_GUIDANCE.find((entry) => entry.category === category)?.note;
}

/**
 * Builds the guidance view model for a coverage. Generic guidance applies to every
 * coverage, so this always returns a model; callers decide whether to render it.
 */
export function buildCoverageGuidance(
  category: string | null | undefined,
  termsUrl: string | undefined,
): CoverageGuidance {
  return {
    scenarios: COVERAGE_SCENARIOS,
    baseline: SG_STATUTORY_BASELINE,
    categoryNote: categoryGuidance(category),
    termsUrl: termsUrl || undefined,
    disclaimer: GUIDANCE_DISCLAIMER,
  };
}
