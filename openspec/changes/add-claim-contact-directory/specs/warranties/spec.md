## MODIFIED Requirements

### Requirement: Claim information

The system SHALL make claim-relevant details available on the product detail page: coverage contact (hotline, email, URL), suggested claim information from the claim directory, notes, serial number, retailer, and proof of purchase. When adding or editing a coverage, the system SHALL prefill the contact fields from the matching claim directory entry, and contact information entered by the user SHALL take precedence over the suggestion. When a user override exists, the system SHALL offer a "Reset to suggested" action that removes the override.

#### Scenario: Coverage contact is tappable

- **WHEN** a coverage has a contact hotline, email, or URL and the user expands the coverage
- **THEN** the contact is shown as an actionable link

#### Scenario: Suggested claim information appears for a matching coverage

- **WHEN** a coverage resolves to a claim directory entry and the user expands the coverage
- **THEN** the suggested claim details are shown alongside any user-provided contact information

#### Scenario: Coverage dialog prefills from the directory

- **WHEN** a user adds or edits a coverage whose product brand or retailer matches a claim directory entry
- **THEN** the contact fields are prefilled from the matching entry and remain editable

#### Scenario: User-entered contact wins over the suggestion

- **WHEN** a coverage has both user-entered contact information and a matching directory entry
- **THEN** the user-entered contact information is displayed instead of the suggestion

#### Scenario: Reset to suggested restores the suggestion

- **WHEN** a user activates "Reset to suggested" on a coverage with a user override
- **THEN** the override is removed and the suggested claim information is displayed when a directory entry matches
