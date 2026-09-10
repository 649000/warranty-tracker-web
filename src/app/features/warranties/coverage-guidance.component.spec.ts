import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { CoverageGuidanceComponent } from './coverage-guidance.component';
import { buildCoverageGuidance } from '../../core/models/coverage-guidance';

function setup(category: string | undefined, termsUrl: string | undefined) {
  const fixture = TestBed.createComponent(CoverageGuidanceComponent);
  fixture.componentRef.setInput('guidance', buildCoverageGuidance(category, termsUrl));
  fixture.detectChanges();
  return fixture;
}

function textOf(fixture: ReturnType<typeof setup>): string {
  return (fixture.nativeElement as HTMLElement).textContent ?? '';
}

describe('CoverageGuidanceComponent', () => {
  it('renders the heading, scenarios, baseline, and disclaimer', () => {
    const fixture = setup('Computers', undefined);
    const text = textOf(fixture);
    expect(text).toContain("What's Typically Covered");
    expect(text).toContain('Typically Covered');
    expect(text).toContain('Typically Excluded');
    expect(text).toContain('Varies');
    expect(text).toContain('consumer law');
    expect(text).toContain('General guidance only');
  });

  it('shows a category note for a mapped category', () => {
    const fixture = setup('Computers', undefined);
    expect(textOf(fixture)).toContain('Battery and display faults');
  });

  it('omits the category note for an unmapped category', () => {
    const fixture = setup('Other', undefined);
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('.guidance-note')).toBeNull();
  });

  it('shows the official terms link when a URL is available', () => {
    const fixture = setup('Computers', 'https://example.com/terms');
    const link = (fixture.nativeElement as HTMLElement).querySelector('.guidance-block__link');
    expect(link?.getAttribute('href')).toBe('https://example.com/terms');
    expect(link?.getAttribute('rel')).toContain('noopener');
  });

  it('omits the official terms link when no URL is available', () => {
    const fixture = setup('Computers', undefined);
    expect((fixture.nativeElement as HTMLElement).querySelector('.guidance-block__link')).toBeNull();
  });
});
