# Transaction Management Section - Changes Summary

## Overview

This document summarizes the changes made to move Bulk CSV Import to MVP and Individual Transaction Entry to Post-MVP.

---

## Key Changes

### 1. Section 3.1: Bulk CSV Import → MVP (Was Post-MVP)

**Changed from**: "Should Have (Post-MVP)"
**Changed to**: "Must Have (MVP)"

**New Requirements (FR-TRANS-001 through FR-TRANS-007)**:
- CSV file upload and validation (10MB max, 10,000 rows)
- Column mapping interface with auto-detection
- Data validation with preview and error reporting
- Symbol and account disambiguation
- Import processing with progress tracking
- Post-import summary and 24-hour rollback
- CSV templates and import history

**Rationale**:
- Most users have historical data from brokers (CSV exports)
- Onboarding users with existing portfolios is critical
- Manual entry of hundreds of transactions is impractical
- Provides immediate value vs tedious manual entry
- Supports common broker formats (Fidelity, Schwab, Interactive Brokers)

---

### 2. Section 3.2: Transaction List & Search → MVP (Unchanged)

**Priority**: Still MVP

**Contents**: Transaction table, search, filters, sorting, pagination, bulk actions

**No changes** - This section remains as-is for MVP

---

### 3. Section 3.3: Transaction Type Reference → MVP (Was FR-TRANS-002)

**Changed from**: Part of Transaction CRUD (FR-TRANS-002)
**Changed to**: Standalone section "Transaction Type Reference" (FR-TRANS-201, FR-TRANS-202)

**Purpose**: Documentation for all transaction types used in CSV import validation

**Contents**:
- Initial Position (with priority rule documentation)
- Buy Transaction
- Sell Transaction
- Dividend Transaction
- Forward Split
- Reverse Split (with fractional share handling)
- Field definitions table

**Rationale**: Still needed for MVP but as reference documentation for CSV import, not for manual form entry

---

### 4. Section 3.4: Individual Transaction Entry → POST-MVP (Was MVP)

**Changed from**: "Must Have (MVP)" as Section 3.1
**Changed to**: "Could Have (Post-MVP - Month 5+)" as Section 3.4

**Moved to**: Post-MVP Phase 1 (Month 5-6)

**New Contents (FR-TRANS-301 through FR-TRANS-303)**:
- Manual transaction form (Post-MVP)
- Transaction editing (basic in MVP, full form in Post-MVP)
- Transaction deletion (available in MVP)

**Rationale**:
- Bulk CSV handles 90% of initial data entry use case
- Manual entry useful but not critical for launch
- Adds UI complexity (form, autocomplete, validation, mobile)
- Can be added quickly (1-2 weeks) based on user feedback
- Users can still edit/delete imported transactions in MVP

**MVP Capabilities Retained**:
- ✅ Delete transactions via transaction list
- ✅ Re-import corrected CSV to update transactions
- ✅ View and search all transactions

**Post-MVP Additions**:
- 🔄 In-place form editing
- 🔄 Manual single transaction form
- 🔄 Symbol autocomplete in form
- 🔄 Duplicate transaction feature

---

## MVP Roadmap Impact

### Month 2 Week 3-4: Transaction Foundation (UPDATED)

**Before**:
- Transaction data model
- Transaction form (basic: Buy, Sell, Dividend)
- Transaction list view
- Transaction CRUD operations
- Symbol search (basic, local only)

**After**:
- Transaction data model
- ✅ **Bulk CSV import foundation** (file upload, parsing)
- ✅ **Column mapping interface**
- ✅ **Data validation and preview**
- Transaction list view
- Symbol disambiguation logic
- Account matching logic

---

### Month 4 Week 1: Additional Transaction Types (UPDATED)

**Before**:
- Initial Position transaction type
- Stock Split (Forward & Reverse)
- Split ratio calculation and adjustment
- Transaction type validation
- Historical cost basis adjustment

**After**:
- Initial Position via CSV import
- Stock Split via CSV import
- Split ratio calculation and adjustment
- Transaction type validation in CSV import
- Historical cost basis adjustment
- ✅ **Broker-specific CSV templates** (Fidelity, Schwab, Interactive Brokers)
- ✅ **Import history and rollback feature**
- ✅ **Symbol-to-exchange mapping persistence**
- ~~Manual transaction form~~ → Moved to Post-MVP Month 5

---

## Updated MVP Feature Checklist

### Transaction Management ✓

**MVP** (Available):
- [x] Bulk CSV import (file upload, column mapping, validation)
- [x] Import broker CSV formats (Fidelity, Schwab, Interactive Brokers)
- [x] Symbol and account disambiguation
- [x] Import progress tracking
- [x] Import history and rollback (24 hours)
- [x] Transaction list with search/filter
- [x] Transaction deletion
- [x] Transaction export (CSV)
- [x] Pagination and sorting
- [x] Bulk delete

**Post-MVP** (Month 5+):
- [ ] Manual transaction form (single entry)
- [ ] In-place transaction editing
- [ ] Symbol autocomplete in form
- [ ] Duplicate transaction feature
- [ ] Bulk edit transactions

---

## Files to Update

1. **feature-specifications.md** (Lines 186-386):
   - Replace entire "3. Transaction Management" section
   - Content prepared in: `TRANSACTION_SECTION_UPDATE.md`

2. **mvp-roadmap.md** (Lines 68-119):
   - Update Month 2 Week 3-4 description
   - Update Month 4 Week 1 description
   - Update MVP Feature Checklist (lines 175-182)

3. **technology-stack.md** (No changes needed):
   - CSV parsing library already included (Papa Parse or similar)

4. **quick-start-guide.md** (No changes needed):
   - Setup instructions remain the same

---

## Next Steps

1. Review this summary and the detailed section in `TRANSACTION_SECTION_UPDATE.md`
2. Approve the changes
3. Apply changes to `feature-specifications.md` (replace lines 186-386)
4. Update `mvp-roadmap.md` accordingly
5. Update unit testing requirements to reflect bulk CSV import tests
6. Commit all changes

---

## Benefits of This Change

### For Users:
✅ **Faster onboarding**: Import years of history in minutes, not hours
✅ **Less friction**: No need to learn manual form before getting value
✅ **Immediate portfolio view**: See full portfolio after one CSV import
✅ **Familiar workflow**: Users already export CSVs from their brokers

### For Development:
✅ **Faster MVP**: CSV import is one feature vs many (form, autocomplete, validation, mobile UX)
✅ **Better UX focus**: Polish one feature well instead of two features poorly
✅ **Data-driven**: Launch with bulk import, add manual entry based on feedback
✅ **Lower complexity**: Batch processing simpler than interactive form validation

### For Business:
✅ **Higher activation rate**: Users see value immediately after CSV import
✅ **Better retention**: Users with full portfolio imported are more likely to stay
✅ **Competitive advantage**: Few competitors offer robust CSV import in MVP
✅ **Scalability**: Bulk import handles power users with 1,000+ transactions

---

*Last Updated: January 28, 2026*
*Status: Ready for Review and Approval*
