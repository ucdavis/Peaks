# Fix WCAG Level A accessibility issues in forms, tables, and help controls

## Summary

An accessibility review identified missing accessible names, visible-label mismatches, blank table headers, and keyboard-inaccessible help content in Peaks. These issues affect screen-reader, speech-input, and keyboard users and correspond to WCAG Level A requirements.

The findings below come from source review and selected rendered-component checks, not a live Siteimprove scan. Siteimprove rule references identify likely checks; actual detection depends on which pages and interaction states the scanner reaches.

## Findings

### 1. Form controls lack accessible names

**WCAG:** 4.1.2 Name, Role, Value (A). Disconnected visible labels also affect 1.3.1 Info and Relationships (A).

**Siteimprove:** [SIA-R8: Form fields have an accessible name](https://alfa.siteimprove.com/rules/sia-r8).

Rendered-component checks confirmed ten editable controls with empty accessible names:

| File | Controls | Lines at time of review |
| --- | --- | --- |
| `Keas.Mvc/ClientApp/src/components/Access/AccessEditValues.tsx` | Name; Notes | 49; 69 |
| `Keas.Mvc/ClientApp/src/components/Keys/KeyEditValues.tsx` | Name; Code; Notes | 77; 94; 112 |
| `Keas.Mvc/ClientApp/src/components/Keys/KeySerialEditValues.tsx` | Key Serial Number; Status; Notes | 96; 111; 127 |
| `Keas.Mvc/ClientApp/src/components/Workstations/WorkstationEditValues.tsx` | Notes | 71 |
| `Keas.Mvc/ClientApp/src/components/Equipment/EquipmentEditValues.tsx` | Managed System ID | 300 |

The workstation filter `<select>` in `Keas.Mvc/ClientApp/src/components/Spaces/SpacesTable.tsx:25` also lacks an accessible name. The label on its surrounding container does not name the select itself.

**Expected fix:** Associate each control with its visible label using matching `id` and `htmlFor` values (`for` on Reactstrap `Label`), or a wrapping label. Give the table filter a descriptive accessible name. Keep IDs unique when multiple forms or dialogs are mounted.

### 2. Equipment help links have no accessible names

**WCAG:** 4.1.2 Name, Role, Value (A), and 2.4.4 Link Purpose (In Context) (A).

**Siteimprove:** [SIA-R11: Links have an accessible name](https://alfa.siteimprove.com/rules/sia-r11).

These links contain only an `InformationCircleIcon`, which renders with `aria-hidden="true"`. Rendered checks confirmed empty accessible names for all three:

| File | Link | Line |
| --- | --- | --- |
| `Keas.Mvc/ClientApp/src/components/Equipment/EquipmentEditValues.tsx` | Protection Level help | 191 |
| `Keas.Mvc/ClientApp/src/components/Equipment/EquipmentEditValues.tsx` | Availability Level help | 220 |
| `Keas.Mvc/ClientApp/src/components/Equipment/EquipmentAttributes.tsx` | Attributes documentation | 59 |

**Expected fix:** Add descriptive link text, visually hidden text, or an accessible name such as “About protection levels.”

### 3. Accessible names omit visible labels

**WCAG:** [2.5.3 Label in Name (A)](https://www.w3.org/WAI/WCAG22/Understanding/label-in-name.html).

**Siteimprove:** [SIA-R14: Visible labels are included in accessible names](https://alfa.siteimprove.com/rules/sia-r14) applies to the links and button below.

| File | Visible label | Current accessible name | Line |
| --- | --- | --- | --- |
| `Keas.Mvc/Views/Admin/Index.cshtml` | Admin roles | Manage roles for {team} | 29 |
| `Keas.Mvc/Views/Admin/Index.cshtml` | View group | View {group} | 51 |
| `Keas.Mvc/Views/DocumentSettings/Index.cshtml` | Select account | Select {account} | 63 |

The shared search control has a related issue. `Keas.Mvc/ClientApp/src/components/Shared/SearchCombobox.tsx:111` uses the placeholder as its `aria-label`, overriding an associated visible label. Rendered checks confirmed:

- **Supervisor** is named **Search for person by name or email**.
- **Room** is named **Search for space**.

Relevant callers include `People/PersonEditValues.tsx:198`, `People/AssignPerson.tsx:36`, and `Workstations/WorkstationEditValues.tsx:64`, under `Keas.Mvc/ClientApp/src/components/`. Equipment's Room label also targets `room`, while its search input uses `searchSpaces` (`Equipment/EquipmentEditValues.tsx:382`).

**Expected fix:** Include the complete visible label in each accessible name. Let search controls use their associated labels instead of overriding them with placeholder text. Correct the Equipment Room label association. Verify the combobox cases manually; SIA-R14 does not cover these inputs in the same way as links and buttons.

### 4. Action and Details columns have blank headers

**WCAG:** 1.3.1 Info and Relationships (A).

**Siteimprove:** [Empty headers can produce “Table cell missing context”](https://help.siteimprove.com/support/solutions/articles/80001211039-why-do-empty-table-header-cells-cause-accessibility-failures-).

The following report views contain empty action-column headers above populated cells:

| File under `Keas.Mvc/Views/` | Line |
| --- | --- |
| `Report/InactiveSpaces.cshtml` | 38 |
| `Report/PeopleWithIncompleteDocuments.cshtml` | 38 |
| `Report/SupervisorDirectReports.cshtml` | 37 |
| `Report/PersonEquipmentHistoryReport.cshtml` | 28 |
| `Report/PeopleInTeam.cshtml` | 99 |
| `Report/PeopleLeavingWithAssets.cshtml` | 72 |
| `Report/ActionsByAdmins.cshtml` | 64 |
| `Group/PeopleLeavingWithAssets.cshtml` | 73 |
| `Group/IncompleteDocumentsReport.cshtml` | 40 |

The same pattern appears in React tables and nested asset lists, including `Keas.Mvc/ClientApp/src/components/Equipment/EquipmentTable.tsx:71` and `Keas.Mvc/ClientApp/src/components/People/PeopleTable.tsx:31`, which use whitespace-only Details headers.

**Expected fix:** Give each affected action/Details column a meaningful header. A visually hidden label is sufficient, for example:

```html
<th scope="col"><span class="sr-only">Actions</span></th>
```

Check the rendered tables after DataTables/React initialization, including populated rows.

### 5. Managed-system search loses its button name while loading

**WCAG:** 4.1.2 Name, Role, Value (A).

**Siteimprove:** [SIA-R12: Buttons have an accessible name](https://alfa.siteimprove.com/rules/sia-r12).

`Keas.Mvc/ClientApp/src/components/Equipment/EquipmentManagedSystemSearchId.tsx:149` replaces “Search!” with whitespace and a screen-reader-hidden spinner while a request is pending. The resulting button has no accessible name.

**Expected fix:** Retain a meaningful name such as “Searching…” while displaying the spinner. Verify the pending-request state explicitly; a normal page-load scan may miss it.

### 6. Count-explanation tooltips have no keyboard trigger

**WCAG:** [2.1.1 Keyboard (A)](https://www.w3.org/WAI/WCAG22/Understanding/keyboard.html).

The “In Use / Total” explanations are attached to unfocusable, screen-reader-hidden SVG icons in:

- `Keas.Mvc/ClientApp/src/components/Keys/KeyTable.tsx:57`
- `Keas.Mvc/ClientApp/src/components/Keys/KeyList.tsx:49`
- `Keas.Mvc/ClientApp/src/components/Spaces/SpacesTable.tsx:118`

Keyboard users cannot trigger these tooltips to learn what the two counts mean.

**Expected fix:** Make the explanation visible or provide a named, keyboard-focusable help control with an accessible description. Verify keyboard and screen-reader behavior manually; do not rely on automated scanning alone.

## Acceptance criteria

- [ ] Every identified form control and filter has a meaningful accessible name associated with its visible label where present.
- [ ] All three equipment help links have descriptive accessible names.
- [ ] The admin links, account-selection button, Room searches, and Supervisor search expose names containing their visible labels.
- [ ] Affected action/Details columns have meaningful headers in the rendered tables.
- [ ] The managed-system search button retains an accessible name while loading.
- [ ] Keyboard and screen-reader users can access the count explanations in Keys and Spaces.
- [ ] Recheck affected pages and open dialogs with Siteimprove or an equivalent accessibility checker; explicitly exercise the loading state.
- [ ] Add focused regression coverage for the corrected accessible names and label associations, and run the existing accessibility-related tests.

## Review validation

- Actual React components were rendered in memory using existing dependencies, and accessible-name calculations confirmed the ten unnamed edit controls, three unnamed help links, and Room/Supervisor name mismatches.
- Seven existing targeted test files passed, totaling 31 tests. These passing tests did not catch the identified gaps.
- No application source files were changed during the review.
- File line numbers are reference points from the review and may move as fixes are applied.
