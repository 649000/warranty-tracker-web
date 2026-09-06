## Purpose

Controls how the application's light/dark appearance is chosen, letting it follow the user's operating-system preference automatically while still allowing an explicit override.

## ADDED Requirements

### Requirement: Theme preference model

The system SHALL support a three-state theme preference — System, Light, and Dark — defaulting to System when no preference has been saved.

#### Scenario: Defaults to System

- **WHEN** a user first opens the app with no saved theme preference
- **THEN** the app is in System mode and follows the OS theme

#### Scenario: Saved Light or Dark mode is honored

- **WHEN** a returning user has a saved Light or Dark preference
- **THEN** the app uses that explicit mode on load

### Requirement: Automatic system following

The system SHALL follow the operating system's light/dark setting while in System mode, including live updates when the OS setting changes.

#### Scenario: Resolves from the OS at startup

- **WHEN** the app starts in System mode
- **THEN** the applied theme matches the OS `prefers-color-scheme` value

#### Scenario: Updates when the OS theme changes

- **WHEN** the OS light/dark setting changes while the app is in System mode
- **THEN** the applied theme updates immediately to match

#### Scenario: Override suppresses system following

- **WHEN** the user selects an explicit Light or Dark mode
- **THEN** the applied theme no longer changes with the OS setting

### Requirement: Three-state toggle

The system SHALL provide a control that cycles the preference through System, Light, and Dark, and SHALL indicate the current mode with an accessible label.

#### Scenario: Cycling the preference

- **WHEN** the user activates the theme control
- **THEN** the mode advances System → Light → Dark → System

#### Scenario: Accessible current-mode label

- **WHEN** the theme control is focused by a screen reader
- **THEN** its accessible label announces the current mode and the next action

#### Scenario: Preference is persisted

- **WHEN** the user cycles to a mode
- **THEN** the chosen mode is saved and restored on the next visit
