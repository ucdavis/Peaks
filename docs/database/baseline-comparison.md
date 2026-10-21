# Production and TEST schema comparison

Read-only captures taken on October 21, 2026 from the deployed web app's production connection (`keas.database.windows.net / Keas`) and the local TEST connection (`keas-test.database.windows.net / Keas`). No application data, credentials, users, grants, or database settings are included.

Production has 51 tables, four views, and two stored procedures. TEST has 41 tables, the same four views, and the same two procedures.

## Differences

- Production has ten historical tables ending in `_20250421_bak`: Bldg, BldgName, Dept, DeptBldg, DeptName, DeptSpace, Floor, LoadingSpaces, Room, and Spaces. TEST has none of these.
- Production `DeptSpace` has `Room_Share_Station_Count` and `Room_Name`; TEST does not.
- Production `FISOrgs.OrgCode` is `nvarchar(6)`; TEST is `nvarchar(4)`.
- Production has two additional notification indexes: `IX_Notifications_Pending_UserId` and `IX_Notifications_Team_DateCreated`.
- Production has an automatically named KeySerialAssignments index, `nci_msft_1_KeySerialAssignments_E1E481049847DD46716CAB3B3F5C9B0E`, absent from TEST.
- EquipmentAttributeKeys primary key names differ because SQL Server generated their names.
- The expanded capture also records 13 enabled but untrusted TEST foreign keys, all trusted in production: six on Histories, one on Keys, two on KeySerialAssignments, two on KeySerials, one on KeyXSpaces, and Notifications' History FK. Their names and trust flags are in the TEST inventory. Adoption preserves this state and does not validate or repair the underlying rows.

These differences were observed, not reconciled. Adopting migrations must not silently change TEST to match production.

The accompanying JSON files contain ordered catalog metadata for columns, indexes, foreign keys, views, and procedures. They are historical evidence, not assertions about the current live database.

## Existing application model differences

The application model is not a complete description of the production schema. Examples include nullable PersonId columns on Documents and PersonNotifications, required database strings represented as optional EF properties, missing Status and ApiCode columns, a trailing space in Equipment's SystemManagementId column name, and EF relationships without corresponding database foreign keys. The existing read-only view also carries an EF table mapping. A model-only initial migration would therefore not reproduce production.
