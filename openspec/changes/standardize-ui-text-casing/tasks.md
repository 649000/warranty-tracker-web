## 1. Apply Title Case to UI text

- [x] 1.1 Heading/filter/status strings in `warranty-list.component.html` and `warranty-list.component.ts` (`My Warranties`, `Expiring Soon`, `Try Again`, empty-state headings, aria-labels, `Lifetime Coverage`/`No Active Coverage`)
- [x] 1.2 Labels, buttons, aria-labels, and status lines in `warranty-detail.component.html` and `warranty-detail.component.ts` (`Warranty List`, `More Options`, `Delete Product`, `Add Coverage`, `Claim Info`, `Serial Number`, `Proof of Purchase`, `View Proof`, `Add Proof of Purchase`, snackbars/confirms, `Lifetime Coverage`)
- [x] 1.3 Coverage dialog text in `coverage-dialog.component.html` (`Add/Edit Coverage`, `Number of Months`, `Exact Expiry Date (Optional)`, `Contact (Optional)`, aria-labels)
- [x] 1.4 Product form text in `product-form.component.html` and `product-form.component.ts` (`Add/Edit Product`, `Product Name`, `Purchase Date`, `More Details (Optional)`, `Serial Number`, `Save Changes`, snackbars)
- [x] 1.5 Proof input text in `proof-input.component.html` and `proof-input.component.ts` (`Proof of Purchase (Optional)`, `Type Details`, `Add Photo`, `Receipt Details`, `Photo of Receipt`, `Replace/Choose File`, snackbars)
- [x] 1.6 Auth pages (`login`, `signup`, `forgot-password`, `reset-password`) — card titles, buttons, labels, validation messages, links, snackbars in `*.html` and `*.ts`
- [x] 1.7 Account settings page + snackbar (`account-settings.component.html` / `.ts`)
- [x] 1.8 Shell menu + confirm dialog (`shell.component.html` / `.ts`)
- [x] 1.9 Landing page CTAs and feature headings (`landing.component.html`)
- [x] 1.10 Legal headings and numbered section headings (`privacy.component.html`, `terms.component.html`)
- [x] 1.11 Status badge labels (`status-badge.component.ts` — `Expiring Soon`)
- [x] 1.12 Theme toggle aria-labels (`theme.service.ts`)
- [x] 1.13 Not-found heading/link (`not-found.component.ts`)
- [x] 1.14 Duration presets in `catalog.ts` (`6 Months`, `1 Year`, `2 Years`, `3 Years`, `5 Years`, `Lifetime`)

## 2. Verify

- [x] 2.1 Run the full gate (`npm run lint`, `npm test -- --watch=false`, `npm run build`); verify all pass.
