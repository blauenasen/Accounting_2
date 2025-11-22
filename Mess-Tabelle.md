# BOOKING PAGE - COMPLETE MEASUREMENTS SPECIFICATION
**Original Application:** http://localhost:5173
**Target Application:** http://localhost:5174 (Accounting_2)
**Measurement Date:** 2025-11-22
**Precision:** Sub-pixel accurate using Chrome DevTools MCP

---

## TABLE OF CONTENTS
1. [Primanota View](#primanota-view)
2. [Kontoansicht (Account View)](#kontoansicht-account-view)
3. [OP-Ansicht (Open Items View)](#op-ansicht-open-items-view)
4. [Shared Components](#shared-components)
5. [Color Palette](#color-palette)
6. [Typography](#typography)

---

# PRIMANOTA VIEW

## 1. H1 HEADER SECTION

| Element | X | Y | Width | Height | Font-Family | Font-Size | Font-Weight | Color | BG-Color | Margin-Left |
|---------|---|---|-------|--------|-------------|-----------|-------------|-------|----------|-------------|
| H1 "BOOKING" | 18px | 59px | 1439.75px | 25px | Helvetica, Arial, sans-serif | 25px | 700 | rgb(0, 0, 0) | rgb(200, 231, 141) | 10px |
| Status Text | 1467.75px | 59px | 242.25px | 26px | Helvetica, Arial, sans-serif | 11px | 400 | rgb(55, 48, 163) | transparent | 0px |

## 2. CONTROL BAR

| Element | X | Y | Width | Height | Border | Border-Color | BG-Color | Font-Size | Font-Family | Padding |
|---------|---|---|-------|--------|--------|--------------|----------|-----------|-------------|---------|
| Year Select | 18px | 115px | 60px | 30px | 1px solid | rgb(51, 51, 51) | rgb(255, 255, 255) | 12px | Arial | 0px 4px |
| Month Select | 86px | 115px | 55px | 30px | 1px solid | rgb(51, 51, 51) | rgb(255, 255, 255) | 12px | Arial | 0px 4px |
| Book Circle Button | 149px | 105px | 150px | 30px | 1px solid | rgb(51, 51, 51) | rgb(76, 175, 80) | 12px | Helvetica, Arial, sans-serif | 0px 10px |
| Selected Circle (readonly) | 307px | 105px | 150px | 30px | 1px solid | rgb(204, 204, 204) | rgb(249, 249, 249) | 12px | Arial | 0px 6px |

## 3. VIEW MODE BUTTONS

| Button | Description | X | Y | Width | Height | BG-Color | Border | Padding | Active |
|--------|-------------|---|---|-------|--------|----------|--------|---------|--------|
| Primanota | List icon | 208px | 57px | 28px | 28px | transparent | 0px none | 2px | ✅ YES |
| Account | Folder icon | 251px | 57px | 28px | 28px | transparent | 0px none | 2px | ❌ NO |
| OP | Checkmark icon | 294px | 57px | 28px | 28px | transparent | 2px solid rgb(6, 161, 58) | 0px | ❌ NO |
| Filter | Funnel icon | 337px | 57px | 28px | 28px | transparent | 0px none | 2px | - |

**Spacing:** 15px gap between buttons

## 4. BOOK CIRCLE SELECTOR BUTTONS

| Button | X | Y | Width | Height | Border | BG-Color | Padding |
|--------|---|---|-------|--------|--------|----------|---------|
| B005 | 380px | 57px | 28px | 28px | 0px none | transparent | 2px |
| B006 | 423px | 57px | 28px | 28px | 0px none | transparent | 2px |
| B007 | 466px | 57px | 28px | 28px | 0px none | transparent | 2px |
| B008 | 509px | 57px | 28px | 28px | 0px none | transparent | 2px |
| B009 | 552px | 57px | 28px | 28px | 0px none | transparent | 2px |
| B0010 | 595px | 57px | 28px | 28px | 0px none | transparent | 2px |

**Spacing:** 15px gap between buttons

## 5. HIDE STORNOS CHECKBOX

| Element | X | Y | Width | Height |
|---------|---|---|-------|--------|
| Checkbox | 30px | 151px | 14px | 14px |
| Label "Hide Stornos" | 51px | 151px | 69px | 14px |

## 6. TABLE CONTAINER

| Property | Value |
|----------|-------|
| Position X | 20px |
| Position Y | 194px |
| Width | 1580px |
| Background | rgb(229, 240, 234) |
| Border Collapse | collapse |
| Header Row Height | 22px |

## 7. TABLE HEADER COLUMNS (15 columns)

| Column | X | Y | Width | Text-Align | Font-Size | Font-Weight | Color | BG | Padding |
|--------|---|---|-------|------------|-----------|-------------|-------|----|---------|
| ID | 20.5px | 194px | 62.78px | center | 13px | 700 | rgb(34, 34, 34) | transparent | 1px |
| PDF | 82.78px | 194px | 62.78px | center | 13px | 700 | rgb(34, 34, 34) | transparent | 1px |
| W | 145.56px | 194px | 62.78px | center | 13px | 700 | rgb(34, 34, 34) | transparent | 1px |
| No | 208.34px | 194px | 62.78px | center | 13px | 700 | rgb(34, 34, 34) | transparent | 1px |
| Turnover | 271.13px | 194px | 104.63px | center | 13px | 700 | rgb(34, 34, 34) | transparent | 1px |
| SH | 375.75px | 194px | 62.78px | center | 13px | 700 | rgb(34, 34, 34) | transparent | 1px |
| GU | 438.53px | 194px | 62.78px | center | 13px | 700 | rgb(34, 34, 34) | transparent | 1px |
| BU | 501.31px | 194px | 62.78px | center | 13px | 700 | rgb(34, 34, 34) | transparent | 1px |
| Contra Acc | 564.09px | 194px | 115.09px | center | 13px | 700 | rgb(34, 34, 34) | transparent | 1px |
| Doc Number | 679.19px | 194px | 209.27px | center | 13px | 700 | rgb(34, 34, 34) | transparent | 1px |
| Date | 888.45px | 194px | 104.63px | center | 13px | 700 | rgb(34, 34, 34) | transparent | 1px |
| Account | 993.08px | 194px | 94.17px | center | 13px | 700 | rgb(34, 34, 34) | transparent | 1px |
| Booking Text | 1087.25px | 194px | 355.75px | center | 13px | 700 | rgb(34, 34, 34) | transparent | 1px |
| HK | 1443px | 194px | 62.78px | center | 13px | 700 | rgb(34, 34, 34) | transparent | 1px |
| TaxRate | 1505.78px | 194px | 94.22px | center | 13px | 700 | rgb(34, 34, 34) | transparent | 1px |

**Total Table Width:** 1580px

## 8. TABLE BODY

| Property | Value |
|----------|-------|
| Row Height | 35px |
| Cell Border | 1px solid rgb(221, 221, 221) |
| Cell Padding | 2px 4px |

### Cell Text Alignment by Column:
- **ID**: right
- **PDF**: center
- **W**: center
- **No**: right
- **Turnover**: right
- **SH**: center
- **GU**: center
- **BU**: center
- **Contra Acc**: right
- **Doc Number**: left
- **Date**: center
- **Account**: right
- **Booking Text**: left
- **HK**: center
- **TaxRate**: right

## 9. INPUT FORM (BOTTOM SECTION)

### Form Labels (Above Inputs)

| Label | X | Y | Width | Height | Font-Size | Font-Weight | Color |
|-------|---|---|-------|--------|-----------|-------------|-------|
| GU | 30px | 1160px | 37px | 12px | 11px | 700 | rgb(152, 148, 147) |
| Turnover | 79px | 1160px | 80px | 12px | 11px | 700 | rgb(152, 148, 147) |
| SH | 171px | 1160px | 35px | 12px | 11px | 700 | rgb(152, 148, 147) |
| Contra Account | 218px | 1160px | 100px | 12px | 11px | 700 | rgb(152, 148, 147) |
| Reference | 330px | 1160px | 150px | 12px | 11px | 700 | rgb(152, 148, 147) |
| Date | 492px | 1160px | 120px | 12px | 11px | 700 | rgb(152, 148, 147) |
| Account | 624px | 1160px | 100px | 12px | 11px | 700 | rgb(152, 148, 147) |
| Tax | 736px | 1160px | 50px | 12px | 11px | 700 | rgb(152, 148, 147) |
| Due Date | 798px | 1160px | 120px | 12px | 11px | 700 | rgb(152, 148, 147) |
| Disc. | 930px | 1160px | 60px | 12px | 11px | 700 | rgb(152, 148, 147) |

### Input Fields

| Field | X | Y | Width | Height | Border | Border-Color | BG-Color | Font-Size | Text-Align | Readonly |
|-------|---|---|-------|--------|--------|--------------|----------|-----------|------------|----------|
| GU | 30px | 1172px | 37px | 28px | 2px inset | rgb(118, 118, 118) | rgb(249, 250, 251) | 14.4px | center | yes |
| Turnover | 79px | 1172px | 80px | 28px | 2px inset | **rgb(255, 0, 0)** | **rgb(255, 243, 205)** | 14.4px | right | no |
| SH | 171px | 1172px | 35px | 28px | 2px inset | rgb(118, 118, 118) | rgb(249, 250, 251) | 14.4px | center | yes |
| Contra Account | 218px | 1172px | 100px | 28px | 2px inset | rgb(118, 118, 118) | rgb(255, 255, 255) | 14.4px | center | no |
| Reference | 330px | 1172px | 150px | 28px | 2px inset | rgb(118, 118, 118) | rgb(255, 255, 255) | 14.4px | left | no |
| Date | 492px | 1172px | 120px | 28px | 2px inset | rgb(118, 118, 118) | rgb(255, 255, 255) | 14.4px | center | no |
| Account | 624px | 1172px | 100px | 28px | 2px inset | rgb(118, 118, 118) | rgb(243, 244, 246) | 14.4px | center | yes |
| Tax (select) | 736px | 1172px | 50px | 28px | 1px solid | rgb(118, 118, 118) | rgb(255, 255, 255) | 14.4px | center | no |
| Due Date | 798px | 1172px | 120px | 28px | 2px inset | rgb(118, 118, 118) | rgb(255, 255, 255) | 14.4px | center | no |
| Disc. | 930px | 1172px | 60px | 28px | 2px inset | rgb(118, 118, 118) | rgb(255, 255, 255) | 14.4px | right | no |
| Description | 1002px | 1172px | 350px | 28px | 2px inset | rgb(118, 118, 118) | rgb(255, 255, 255) | 14.4px | left | no |

**Font-Family (all inputs):** Arial
**Padding (all inputs):** 4px 6px
**Field Spacing:** 12px gaps between fields

## 10. ACTION BUTTONS (BOTTOM RIGHT)

| Button | X | Y | Width | Height | Border-Radius | BG-Color | Font-Size | Text-Color | Padding |
|--------|---|---|-------|--------|---------------|----------|-----------|------------|---------|
| OK | 1364px | 1172px | 43.27px | 28px | 4px | rgb(76, 175, 80) | 13.33px | rgb(255, 255, 255) | 6px 12px |
| Cancel | 1420.81px | 1172px | 65.5px | 28px | 4px | rgb(244, 67, 54) | 13.33px | rgb(255, 255, 255) | 6px 12px |
| +PDF | 1492.31px | 1172px | 70px | 28px | 4px | rgb(33, 150, 243) | 13.33px | rgb(255, 255, 255) | 6px 18px |

**Button Font-Family:** Arial
**Button Border:** 0px none
**Gap between OK and Cancel:** ~13.5px
**Gap between Cancel and +PDF:** ~6px

## 11. ACCOUNT INFO SECTION (BOTTOM)

| Element | X | Y | Font-Size | Font-Weight | Color |
|---------|---|---|-----------|-------------|-------|
| "Contra Account:" label | 43px | 1239px | 14px | 600 | rgb(51, 51, 51) |
| Account name | 287px | 1239px | 14px | 400 | rgb(85, 85, 85) |
| "Saldo: EUR" | 1371px | 1239px | 14px | 500 | rgb(51, 51, 51) |
| Amount (positive) | 1463px | 1239px | 14px | 600 | rgb(0, 0, 0) |
| "Account:" label | 43px | 1264px | 14px | 600 | rgb(51, 51, 51) |
| Account name | 287px | 1264px | 14px | 400 | rgb(85, 85, 85) |
| "Saldo: EUR" | 1371px | 1264px | 14px | 500 | rgb(51, 51, 51) |
| Amount (negative) | 1463px | 1264px | 14px | 600 | **rgb(220, 38, 38)** |

**Container:** X: 30px, Y: 1228px, Width: 1578px
**Font-Family:** Helvetica, Arial, sans-serif

---

# KONTOANSICHT (ACCOUNT VIEW)

## UNIQUE FEATURES

### 1. BALANCE FIELDS (8 FIELDS - USER POSITIONED!)

#### Row 1: Primary Balance Fields

| Field | Label X | Label Y | Label W | Input X | Input Y | Input W | Input H |
|-------|---------|---------|---------|---------|---------|---------|---------|
| Opening-Balance | 649.08px | 105px | 61.83px | 630px | 115px | 100px | 30px |
| Debit-Balance | 770.88px | 105px | 50.25px | 746px | 115px | 100px | 30px |
| Credit-Balance | 885.53px | 105px | 52.92px | 862px | 115px | 100px | 30px |
| Total-Balance | 1003.75px | 105px | 48.48px | 978px | 115px | 100px | 30px |
| Closing-Balance | 1114.86px | 105px | 58.27px | 1094px | 115px | 100px | 30px |

#### Row 2: Sum Fields

| Field | Label X | Label Y | Label W | Input X | Input Y | Input W | Input H |
|-------|---------|---------|---------|---------|---------|---------|---------|
| Sum Debit | 777.31px | 163px | 37.36px | 746px | 173px | 100px | 30px |
| Sum Credit | 891.98px | 163px | 40.02px | 862px | 173px | 100px | 30px |
| Sum Total | 1010.28px | 163px | 35.44px | 978px | 173px | 100px | 30px |

#### Balance Field Styling (ALL 8 FIELDS)

| Property | Label Value | Input Value |
|----------|-------------|-------------|
| Font-Family | - | Arial |
| Font-Size | **8px** | 14px |
| Font-Weight | 400 | 400 |
| Color | rgb(85, 85, 85) | rgb(0, 0, 0) |
| Text-Align | center | right |
| Border | - | 1px solid rgb(204, 204, 204) |
| Background | - | rgb(249, 249, 249) |
| Padding | - | 0px 6px |
| Readonly | - | true |

**CRITICAL MEASUREMENTS:**
- All inputs: 100px width × 30px height
- Horizontal spacing between inputs: 116px
- Vertical spacing (Row 1 to Row 2): 58px
- Label font-size: **8px** (very small!)

### 2. NAVIGATION BUTTONS (Present in Account View)

| Button | X | Y | Width | Height | BG-Color | Border |
|--------|---|---|-------|--------|----------|--------|
| First (⏮) | 149px | 115px | 30px | 30px | rgb(33, 150, 243) | 1px solid rgb(51, 51, 51) |
| Previous (◀) | 187px | 115px | 30px | 30px | rgb(33, 150, 243) | 1px solid rgb(51, 51, 51) |
| Search Input | 225px | 115px | 80px | 30px | rgb(255, 255, 255) | 1px solid rgb(204, 204, 204) |
| Next (▶) | 313px | 115px | 30px | 30px | rgb(33, 150, 243) | 1px solid rgb(51, 51, 51) |
| Last (⏭) | 351px | 115px | 30px | 30px | rgb(33, 150, 243) | 1px solid rgb(51, 51, 51) |

### 3. SEARCH DISPLAY BOX

| Property | Value |
|----------|-------|
| X | 389px |
| Y | 115px |
| Width | 225px |
| Height | 30px |
| Border | 1px solid rgb(204, 204, 204) |
| Background | rgb(249, 249, 249) |
| Font-Size | 12px |

### 4. ACCOUNT/CONTRA ACCOUNT TOGGLE

| Element | X | Y | Width | Height | State |
|---------|---|---|-------|--------|-------|
| Account Button | 1482px | 105px | 150px | 30px | disabled |
| Contra Account Button | 1482px | 135px | 150px | 30px | disabled |

**Styling:** Border-radius: 6px, Font-size: 12px

### 5. TABLE HEADER COLUMNS (14 columns - different from Primanota!)

| Column | X | Y | Width | Text-Align | Font-Size | Font-Weight |
|--------|---|---|-------|------------|-----------|-------------|
| ID | 36px | 215.5px | 31.19px | center | 13px | 600 |
| PDF | 99.19px | 215.5px | 31.19px | center | 13px | 600 |
| W | 162.38px | 215.5px | 31.19px | center | 13px | 600 |
| No | 225.56px | 215.5px | 31.19px | center | 13px | 600 |
| Date | 289.75px | 215.5px | 82.86px | center | 13px | 600 |
| GU | 404.61px | 215.5px | 31.19px | center | 13px | 600 |
| BU | 467.80px | 215.5px | 31.19px | center | 13px | 600 |
| Contra Acc | 530.98px | 215.5px | 83.86px | center | 13px | 600 |
| Doc Number | 646.84px | 215.5px | 157.59px | center | 13px | 600 |
| TaxRate | 836.44px | 215.5px | 62.80px | center | 13px | 600 |
| Sum Soll | 931.23px | 215.5px | 83.86px | center | 13px | 600 |
| Sum Haben | 1047.09px | 215.5px | 83.86px | center | 13px | 600 |
| Balance | 1162.95px | 215.5px | 83.86px | center | 13px | 600 |
| Booking Text | 1278.81px | 215.5px | 305.19px | center | 13px | 600 |

**Removed columns (vs Primanota):** Turnover, SH, Account, HK
**Added columns:** Sum Soll, Sum Haben, Balance

### 6. HIDE STORNOS CHECKBOX (Position differs!)

| Element | X | Y | Width | Height |
|---------|---|---|-------|--------|
| Checkbox | 30px | **181px** | 14px | 14px |

**Note:** Y-position is 181px (vs 151px in Primanota)

---

# OP-ANSICHT (OPEN ITEMS VIEW)

## CRITICAL DIFFERENCES FROM PRIMANOTA

**OP-Ansicht is DIFFERENT from Primanota!** It is designed for Open Items Management (Forderungen/Verbindlichkeiten).

### Key Differences:
1. **OP Filter Buttons** - Open Items / Balanced Items / All Items (radio buttons, right side)
2. **Reconciliation Button** - Orange button for Auszifferung (X: 1334px, Y: 105px)
3. **8 Balance Fields** - Same as Kontoansicht (Opening, Debit, Credit, Total, Closing, Sum Debit, Sum Credit, Sum Total)
4. **Due Date Column** - Column 9 in table, 91px wide (CRITICAL - unique to OP!)
5. **14 Columns** - Different structure than Primanota's 15 columns
6. **Pagination Buttons** - Navigation controls (⏮ ◀ ▶ ⏭)
7. **Account Selector** - 225px wide dropdown
8. **Reconcile (0) Button** - Gray button at X: 35px, Y: 223px

---

## 1. OP FILTER BUTTONS (Radio Style - Right Side)

| Button | X | Y | Width | Height | Border | BG-Color | Font-Size | Radio Circle | Active |
|--------|---|---|-------|--------|--------|----------|-----------|--------------|--------|
| Open Items | 1482px | 105px | 150px | 30px | 0px none | transparent | 12px | 16x16px, 2px border | ✅ YES |
| Balanced Items | 1482px | 139px | 150px | 30px | 0px none | transparent | 12px | 16x16px, 2px border | ❌ NO |
| All Items | 1482px | 173px | 150px | 30px | 0px none | transparent | 12px | 16x16px, 2px border | ❌ NO |

**Radio Circle Styling:**
- Size: 16px × 16px
- Border-radius: 50%
- Border: 2px solid rgb(51, 51, 51)
- Active: Filled rgb(51, 51, 51)
- Inactive: White rgb(255, 255, 255)
- Vertical spacing: 4px gap between buttons

---

## 2. RECONCILIATION BUTTON

| Property | Value | Notes |
|----------|-------|-------|
| X | 1334px | Top right area |
| Y | 105px | - |
| Width | 150px | - |
| Height | 30px | - |
| Background | rgb(255, 152, 0) | Orange |
| Border | 1px solid rgb(191, 197, 201) | Light gray |
| Font-Size | 12px | - |
| Font-Family | Helvetica, Arial, sans-serif | - |
| Text | "Reconciliation" | - |
| State | enabled | Can be disabled |

---

## 3. BALANCE FIELDS (8 FIELDS - SAME AS KONTOANSICHT)

### Row 1: Primary Balance Fields

| Field | Label X | Label Y | Label W | Input X | Input Y | Input W | Input H |
|-------|---------|---------|---------|---------|---------|---------|---------|
| Opening-Balance | 649px | 105px | 62px | 630px | 115px | 100px | 30px |
| Debit-Balance | 771px | 105px | 50px | 746px | 115px | 100px | 30px |
| Credit-Balance | 886px | 105px | 53px | 862px | 115px | 100px | 30px |
| Total-Balance | 1004px | 105px | 48px | 978px | 115px | 100px | 30px |
| Closing-Balance | 1115px | 105px | 58px | 1094px | 115px | 100px | 30px |

### Row 2: Sum Fields

| Field | Label X | Label Y | Label W | Input X | Input Y | Input W | Input H |
|-------|---------|---------|---------|---------|---------|---------|---------|
| Sum Debit | 777px | 163px | 37px | 746px | 173px | 100px | 30px |
| Sum Credit | 892px | 163px | 40px | 862px | 173px | 100px | 30px |
| Sum Total | 1010px | 163px | 35px | 978px | 173px | 100px | 30px |

### Balance Field Styling (ALL 8 FIELDS)

| Property | Label Value | Input Value |
|----------|-------------|-------------|
| Font-Family | - | Arial |
| Font-Size | **8px** | 14px |
| Font-Weight | 400 | 400 |
| Color | rgb(85, 85, 85) | rgb(0, 0, 0) |
| Text-Align | center | right |
| Border | - | 1px solid rgb(204, 204, 204) |
| Background | - | rgb(249, 249, 249) |
| Padding | - | 0px 6px |
| Readonly | - | true |

**CRITICAL:** Labels haben **8px** Schriftgröße (sehr klein!), Horizontal spacing: 116px, Vertical spacing: 58px

---

## 4. PAGINATION CONTROLS

| Button | X | Y | Width | Height | BG-Color | Border | Font-Size |
|--------|---|---|-------|--------|----------|--------|-----------|
| First (⏮) | 149px | 115px | 30px | 30px | rgb(33, 150, 243) | 1px solid rgb(51, 51, 51) | 14px |
| Previous (◀) | 187px | 115px | 30px | 30px | rgb(33, 150, 243) | 1px solid rgb(51, 51, 51) | 14px |
| Next (▶) | 313px | 115px | 30px | 30px | rgb(33, 150, 243) | 1px solid rgb(51, 51, 51) | 14px |
| Last (⏭) | 351px | 115px | 30px | 30px | rgb(33, 150, 243) | 1px solid rgb(51, 51, 51) | 14px |

**Color:** Blue buttons rgb(33, 150, 243) with white text

---

## 5. ACCOUNT SELECTOR

| Property | Value |
|----------|-------|
| X | 389px |
| Y | 115px |
| Width | 225px |
| Height | 30px |
| Border | 1px solid rgb(204, 204, 204) |
| Background | rgb(249, 249, 249) |
| Font-Size | 12px |
| Font-Family | Arial |

---

## 6. RECONCILE (0) BUTTON

| Property | Value | Notes |
|----------|-------|-------|
| X | 35px | Bottom left area |
| Y | 223px | - |
| Width | 114px | - |
| Height | 32px | - |
| Background | rgb(204, 204, 204) | Gray when disabled |
| Font-Size | 12px | - |
| Text | "Reconcile (0)" | Number shows count |
| State | disabled | Enabled when items selected |

---

## 7. TABLE STRUCTURE (14 COLUMNS)

| # | Column | X | Y | Width | Text-Align | Font-Size | Font-Weight |
|---|--------|---|---|-------|------------|-----------|-------------|
| 1 | ID | 36px | 273px | 35px | center | 13px | 700 |
| 2 | PDF | 103px | 273px | 35px | center | 13px | 700 |
| 3 | W | 170px | 273px | 35px | center | 13px | 700 |
| 4 | X | 238px | 273px | 35px | center | 13px | 700 |
| 5 | T | 305px | 273px | 35px | center | 13px | 700 |
| 6 | GU | 372px | 273px | 35px | center | 13px | 700 |
| 7 | Doc Number | 439px | 273px | 170px | center | 13px | 700 |
| 8 | Date | 642px | 273px | 90px | center | 13px | 700 |
| 9 | **Due Date** | **764px** | **273px** | **91px** | **center** | **13px** | **700** |
| 10 | Booking Text | 888px | 273px | 237px | center | 13px | 700 |
| 11 | Gross Price | 1156px | 273px | 102px | center | 13px | 700 |
| 12 | Contra Account | 1291px | 273px | 102px | center | 13px | 700 |
| 13 | BuNr | 1425px | 273px | 91px | center | 13px | 700 |
| 14 | BookC | 1549px | 273px | 35px | center | 13px | 700 |

**Total Table Width:** ~1580px

**CRITICAL:** **Due Date** (Column 9) ist das Hauptunterscheidungsmerkmal zur Primanota!

---

## 8. TABLE CONTAINER

| Property | Value | Notes |
|----------|-------|-------|
| X | 18px | Same as Primanota |
| Y | 257px | ~60px lower than Primanota due to balance fields |
| Width | 1580px | Same as Primanota |
| Background | rgb(255, 255, 255) | White |
| Border | 1px solid rgb(204, 204, 204) | Light gray |

---

## 9. HIDE STORNOS CHECKBOX (Same as Kontoansicht)

| Element | X | Y | Width | Height |
|---------|---|---|-------|--------|
| Checkbox | 30px | **181px** | 14px | 14px |
| Label | 51px | 181px | 69px | 14px |

---

## 10. YEAR/MONTH SELECTORS (Same as other views)

| Element | X | Y | Width | Height |
|---------|---|---|-------|--------|
| Year Select | 18px | 115px | 60px | 30px |
| Month Select | 86px | 115px | 55px | 30px |

---

## 11. VIEW MODE BUTTONS (Active: OP)

| Button | X | Y | Border | Padding | Active |
|--------|---|---|--------|---------|--------|
| Primanota | 208px | 57px | 0px none | 2px | ❌ NO |
| Kontoansicht | 251px | 57px | 0px none | 2px | ❌ NO |
| **OP-Ansicht** | **294px** | **57px** | **2px solid rgb(6, 161, 58)** | **0px** | **✅ YES** |

---

## 12. INPUT FORM (BOTTOM - IDENTICAL TO PRIMANOTA)

Same as Primanota input form at Y: 1172px with all 11 fields and 3 buttons.

---

## 13. OP-SPECIFIC COLORS

| Element | RGB | HEX | Usage |
|---------|-----|-----|-------|
| Reconciliation Button | rgb(255, 152, 0) | #FF9800 | Orange |
| Reconcile (0) Disabled | rgb(204, 204, 204) | #CCCCCC | Gray |
| Pagination Buttons | rgb(33, 150, 243) | #2196F3 | Blue |
| Active Radio Fill | rgb(51, 51, 51) | #333333 | Dark gray |

---

## 14. IMPLEMENTATION NOTES

1. **OP-Ansicht ≠ Primanota** - Komplett verschiedene Tabellen-Struktur!
2. **Due Date-Spalte** - Essentiell für Fälligkeitsüberwachung
3. **Balance-Felder** - Identisch mit Kontoansicht, **8px Labels!**
4. **OP-Filter** - Radio-Buttons, nicht Checkboxes
5. **Reconciliation** - Orange Button oben rechts
6. **Pagination** - Blaue Navigation-Buttons
7. **14 Spalten** vs 15 in Primanota
8. **Table Y-Position** - Niedriger (257px vs 194px) wegen Balance-Felder

---

# SHARED COMPONENTS

## VIEW MODE BUTTON ACTIVE STATES

| View | Active Button | Border | Padding |
|------|---------------|--------|---------|
| Primanota | List icon (X: 208px) | 0px none | 2px |
| Kontoansicht | Folder icon (X: 251px) | 2px solid rgb(6, 161, 58) | 0px |
| OP-Ansicht | Checkmark icon (X: 294px) | 2px solid rgb(6, 161, 58) | 0px |

**Pattern:** Active view gets green border, padding changes from 2px to 0px

---

# COLOR PALETTE

| Element Type | Color Name | RGB | HEX | Usage |
|--------------|------------|-----|-----|-------|
| Page BG | Light Green | rgb(200, 231, 141) | #C8E78D | H1 background |
| Table BG | Light Green-Gray | rgb(229, 240, 234) | #E5F0EA | Table background |
| Primary Text | Black | rgb(0, 0, 0) | #000000 | Main text |
| Secondary Text | Dark Gray | rgb(34, 34, 34) | #222222 | Table headers |
| Label Text | Gray | rgb(152, 148, 147) | #989493 | Form labels |
| Border Light | Light Gray | rgb(221, 221, 221) | #DDDDDD | Table cells |
| Border Medium | Medium Gray | rgb(118, 118, 118) | #767676 | Input borders |
| Border Dark | Dark Gray | rgb(51, 51, 51) | #333333 | Selects/buttons |
| Readonly BG 1 | Very Light Gray | rgb(249, 250, 251) | #F9FAFB | Readonly inputs |
| Readonly BG 2 | Light Gray | rgb(243, 244, 246) | #F3F4F6 | Account readonly |
| Active Input BG | Light Yellow | rgb(255, 243, 205) | #FFF3CD | Turnover field |
| Active Border | Red | rgb(255, 0, 0) | #FF0000 | Turnover border |
| Green Button | Green | rgb(76, 175, 80) | #4CAF50 | OK, Book Circle |
| Red Button | Red | rgb(244, 67, 54) | #F44336 | Cancel |
| Blue Button | Blue | rgb(33, 150, 243) | #2196F3 | +PDF, Nav |
| Status Text | Purple | rgb(55, 48, 163) | #3730A3 | Status line |
| Negative Amount | Red | rgb(220, 38, 38) | #DC2626 | Negative values |
| Active View Border | Green | rgb(6, 161, 58) | #06A13A | Active view |
| Balance Label | Dark Gray | rgb(85, 85, 85) | #555555 | 8px labels |
| Balance BG | Very Light Gray | rgb(249, 249, 249) | #F9F9F9 | Balance inputs |
| Balance Border | Light Gray | rgb(204, 204, 204) | #CCCCCC | Balance borders |
| Reconciliation Button | Orange | rgb(255, 152, 0) | #FF9800 | OP-Ansicht only |
| Reconcile (0) Disabled | Gray | rgb(204, 204, 204) | #CCCCCC | OP-Ansicht only |
| Active Radio Fill | Dark Gray | rgb(51, 51, 51) | #333333 | OP-Ansicht radio |

---

# TYPOGRAPHY

| Element | Font-Family | Font-Size | Font-Weight | Line-Height |
|---------|-------------|-----------|-------------|-------------|
| H1 | Helvetica, Arial, sans-serif | 25px | 700 | 25px |
| Status Text | Helvetica, Arial, sans-serif | 11px | 400 | - |
| Table Headers | Helvetica, Arial, sans-serif | 13px | 700 | - |
| Form Labels | Helvetica, Arial, sans-serif | 11px | 700 | - |
| Balance Labels | - | **8px** | 400 | - |
| Inputs | Arial | 14.4px | 400 | - |
| Balance Inputs | Arial | 14px | 400 | - |
| Date Inputs | monospace | 14.4px | 400 | - |
| Buttons | Arial | 13.33px | 400 | - |
| Selects | Arial | 12px | 400 | - |
| Account Info | Helvetica, Arial, sans-serif | 14px | 400/500/600 | - |

---

# IMPLEMENTATION NOTES

## 1. Border Style
- Input fields use `inset` border style (2px) for 3D sunken effect
- Turnover field has special `2px inset` with **red border** rgb(255, 0, 0)

## 2. Date Fields
- Use HTML5 `type="date"` with monospace font
- Display format: DD.MM.YYYY with dots as separators

## 3. Turnover Field Special State
- **Red border:** rgb(255, 0, 0)
- **Yellow background:** rgb(255, 243, 205)
- Indicates required/focused/active state

## 4. Balance Fields (Kontoansicht Only)
- **Labels extremely small:** 8px font-size
- **All inputs identical:** 100px × 30px
- **Horizontal spacing:** 116px between input centers
- **Vertical spacing:** 58px from row 1 to row 2
- **Readonly:** All balance fields readonly
- **Text-align:** Labels centered, values right-aligned

## 5. Negative Amounts
- Display in red: rgb(220, 38, 38)
- Positive amounts in black: rgb(0, 0, 0)

## 6. Active View State
- Green border: 2px solid rgb(6, 161, 58)
- Padding adjusts: 2px (inactive) → 0px (active)

## 7. Table Width
- Total: 1580px
- Header sticky positioned
- Body scrollable

## 8. Responsive Considerations
- Page designed for ~1700px viewport width minimum
- No responsive breakpoints observed

---

# MEASUREMENT ACCURACY

All measurements captured using:
- **Chrome DevTools** via MCP (Model Context Protocol)
- **getBoundingClientRect()** for positions and dimensions
- **window.getComputedStyle()** for all CSS properties
- **Sub-pixel precision** where available

**Measurement Date:** 2025-11-22
**Source:** Original Application (localhost:5173)
**Target:** Accounting_2 (localhost:5174)

---

**END OF SPECIFICATION**
