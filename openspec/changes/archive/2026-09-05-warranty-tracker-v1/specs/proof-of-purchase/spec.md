## Purpose

Lets users attach proof of purchase to a product as typed text, a photo, or a PDF, with image proofs downsized client-side before upload, stored privately per user and viewable on demand.

## ADDED Requirements

### Requirement: Capture text proof

The system SHALL let a user record proof of purchase as typed text (for example, a receipt number and retailer).

#### Scenario: Save text proof

- **WHEN** a user enters text as proof of purchase and saves
- **THEN** the text is stored with the product and shown on the product detail page

### Requirement: Upload image proof

The system SHALL let a user upload a photo as proof of purchase and SHALL downsize/compress it on the client before upload, stripping embedded metadata.

#### Scenario: Upload and downsize an image

- **WHEN** a user selects a photo as proof of purchase
- **THEN** the image is compressed and resized client-side, metadata is removed, and only the downsized file is uploaded

#### Scenario: Replace image proof

- **WHEN** a user replaces an existing image proof with a new one
- **THEN** the old uploaded file is removed and the new one becomes the proof

### Requirement: Upload PDF proof

The system SHALL let a user upload a PDF as proof of purchase without modification.

#### Scenario: Upload a PDF

- **WHEN** a user selects a PDF as proof of purchase
- **THEN** the PDF is stored as-is and linked to the product

### Requirement: View proof

The system SHALL let a user view an attached proof: images in a lightbox, PDFs in a new tab, and text inline.

#### Scenario: View image proof

- **WHEN** a user taps an image proof
- **THEN** a lightbox opens showing the image

#### Scenario: View PDF proof

- **WHEN** a user taps a PDF proof
- **THEN** the PDF opens in a new browser tab

#### Scenario: View text proof

- **WHEN** a user opens a text proof
- **THEN** the stored text is displayed inline

### Requirement: Proof is optional and private

The system SHALL treat proof of purchase as optional and SHALL restrict access to the owning user.

#### Scenario: Product without proof

- **WHEN** a product has no proof of purchase
- **THEN** the product is saved and functions normally, with an option to add proof later

#### Scenario: Proof access is owner-only

- **WHEN** a user who is not the owner attempts to access a proof file
- **THEN** access is denied at the storage layer
