import { describe, expect, it } from 'vitest';
import {
  buildCoverageGuidance,
  categoryGuidance,
  CATEGORY_GUIDANCE,
  COVERAGE_SCENARIOS,
  GUIDANCE_DISCLAIMER,
  SG_STATUTORY_BASELINE,
} from './coverage-guidance';

describe('COVERAGE_SCENARIOS', () => {
  it('covers the required scenarios', () => {
    const ids = COVERAGE_SCENARIOS.map((scenario) => scenario.id);
    expect(ids).toEqual(
      expect.arrayContaining([
        'manufacturing-defect',
        'accidental-damage',
        'liquid-damage',
        'wear-and-tear',
        'cosmetic-damage',
        'unauthorized-repair',
        'theft-loss',
      ]),
    );
  });

  it('gives every scenario a verdict and explanation', () => {
    for (const scenario of COVERAGE_SCENARIOS) {
      expect(['covered', 'excluded', 'varies']).toContain(scenario.verdict);
      expect(scenario.label.length).toBeGreaterThan(0);
      expect(scenario.explanation.length).toBeGreaterThan(0);
    }
  });

  it('distinguishes a covered scenario from an excluded one', () => {
    expect(COVERAGE_SCENARIOS.find((s) => s.id === 'manufacturing-defect')?.verdict).toBe(
      'covered',
    );
    expect(COVERAGE_SCENARIOS.find((s) => s.id === 'accidental-damage')?.verdict).toBe('excluded');
  });
});

describe('categoryGuidance', () => {
  it('returns a note for a mapped category', () => {
    expect(categoryGuidance('Computers')).toBe(
      CATEGORY_GUIDANCE.find((entry) => entry.category === 'Computers')?.note,
    );
  });

  it('returns nothing for an unmapped category', () => {
    expect(categoryGuidance('Other')).toBeUndefined();
  });

  it('returns nothing when the category is missing', () => {
    expect(categoryGuidance(undefined)).toBeUndefined();
    expect(categoryGuidance(null)).toBeUndefined();
    expect(categoryGuidance('')).toBeUndefined();
  });
});

describe('buildCoverageGuidance', () => {
  it('includes scenarios, baseline, and disclaimer', () => {
    const guidance = buildCoverageGuidance('Computers', undefined);
    expect(guidance.scenarios).toBe(COVERAGE_SCENARIOS);
    expect(guidance.baseline).toBe(SG_STATUTORY_BASELINE);
    expect(guidance.disclaimer).toBe(GUIDANCE_DISCLAIMER);
  });

  it('includes a category note only when the category is mapped', () => {
    expect(buildCoverageGuidance('Computers', undefined).categoryNote).toBeTruthy();
    expect(buildCoverageGuidance('Other', undefined).categoryNote).toBeUndefined();
    expect(buildCoverageGuidance(undefined, undefined).categoryNote).toBeUndefined();
  });

  it('passes through an official terms link and drops an empty one', () => {
    expect(buildCoverageGuidance(undefined, 'https://example.com/terms').termsUrl).toBe(
      'https://example.com/terms',
    );
    expect(buildCoverageGuidance(undefined, undefined).termsUrl).toBeUndefined();
    expect(buildCoverageGuidance(undefined, '').termsUrl).toBeUndefined();
  });
});
