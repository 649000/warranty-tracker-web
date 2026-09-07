## MODIFIED Requirements

### Requirement: Editorial conventions

The system SHALL use Title Case for user-facing UI text — headings, labels, buttons, links, statuses, chips, and short messages — capitalizing every major word while keeping minor words (articles, conjunctions, and short prepositions such as `of`, `in`, `to`, `the`, `a`, `an`, `and`, `or`, `with`, `for`) lowercase unless they are the first or last word. The system SHALL keep long-form prose (legal and marketing body copy, descriptive error paragraphs) in sentence case, SHALL avoid all-caps labels, SHALL NOT use em-dashes as meta-text separators (using a middot instead), and SHALL render numbers with tabular figures.

#### Scenario: Labels are not all-caps

- **WHEN** any label or button text is rendered
- **THEN** it is in Title Case, not transformed to uppercase

#### Scenario: Headings and statuses use Title Case

- **WHEN** a page title, card title, section heading, status, or chip is rendered
- **THEN** each major word is capitalized and minor words are lowercase (for example, "My Warranties", "Account Settings", "Expiring Soon", "Lifetime Coverage", "Proof of Purchase")

#### Scenario: Proper nouns keep their capitalization

- **WHEN** a proper noun such as "Warranty Tracker", "Google", or "Firebase" appears in any copy
- **THEN** its capitalization is preserved regardless of Title Case

#### Scenario: Long-form prose stays sentence case

- **WHEN** legal body copy, a marketing lede, or a multi-clause error paragraph is rendered
- **THEN** it uses sentence case rather than Title Case

#### Scenario: Meta text uses middot separators

- **WHEN** secondary metadata combines multiple fields (for example, category and coverage count)
- **THEN** fields are separated with a middot, not an em-dash
