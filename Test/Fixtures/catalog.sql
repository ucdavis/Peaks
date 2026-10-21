SET NOCOUNT ON;
SELECT t.name, SCHEMA_NAME(t.schema_id) AS [schema], t.type,
JSON_QUERY((SELECT c.name, TYPE_NAME(c.user_type_id) AS [type], c.max_length, c.precision, c.scale,
 c.is_nullable, c.is_identity, c.collation_name, CONVERT(nvarchar(100),ic.seed_value) AS identity_seed,
 CONVERT(nvarchar(100),ic.increment_value) AS identity_increment,
 dc.definition AS [default], cc.definition AS computed, cc.is_persisted,
 c.generated_always_type, c.is_rowguidcol
 FROM sys.columns c
 LEFT JOIN sys.default_constraints dc ON c.default_object_id=dc.object_id
 LEFT JOIN sys.computed_columns cc ON c.object_id=cc.object_id AND c.column_id=cc.column_id
 LEFT JOIN sys.identity_columns ic ON c.object_id=ic.object_id AND c.column_id=ic.column_id
 WHERE c.object_id=t.object_id ORDER BY c.column_id FOR JSON PATH)) AS columns,
JSON_QUERY((SELECT CASE WHEN kc.is_system_named=1 THEN '<system-generated-key>' ELSE i.name END AS name,
 i.type_desc, i.is_unique, i.is_primary_key, i.is_unique_constraint, i.filter_definition, i.is_disabled,
 JSON_QUERY((SELECT c.name, ic.is_descending_key, ic.is_included_column
 FROM sys.index_columns ic JOIN sys.columns c ON c.object_id=ic.object_id AND c.column_id=ic.column_id
 WHERE ic.object_id=i.object_id AND ic.index_id=i.index_id
 ORDER BY ic.key_ordinal, ic.index_column_id FOR JSON PATH)) AS columns
 FROM sys.indexes i LEFT JOIN sys.key_constraints kc ON kc.parent_object_id=i.object_id AND kc.unique_index_id=i.index_id
 WHERE i.object_id=t.object_id AND i.name IS NOT NULL ORDER BY name FOR JSON PATH)) AS indexes,
JSON_QUERY((SELECT f.name, OBJECT_SCHEMA_NAME(f.referenced_object_id) AS principalSchema,
 OBJECT_NAME(f.referenced_object_id) AS principal, f.delete_referential_action_desc AS onDelete,
 f.update_referential_action_desc AS onUpdate, f.is_disabled, f.is_not_trusted, f.is_not_for_replication,
 JSON_QUERY((SELECT COL_NAME(fc.parent_object_id,fc.parent_column_id) AS name,
 COL_NAME(fc.referenced_object_id,fc.referenced_column_id) AS principalColumn
 FROM sys.foreign_key_columns fc WHERE fc.constraint_object_id=f.object_id
 ORDER BY fc.constraint_column_id FOR JSON PATH)) AS columns
 FROM sys.foreign_keys f WHERE f.parent_object_id=t.object_id ORDER BY f.name FOR JSON PATH)) AS foreignKeys,
JSON_QUERY((SELECT c.name,c.definition,c.is_disabled,c.is_not_trusted,c.is_not_for_replication
 FROM sys.check_constraints c WHERE c.parent_object_id=t.object_id ORDER BY c.name FOR JSON PATH)) AS checks,
OBJECT_DEFINITION(t.object_id) AS definition,
m.uses_ansi_nulls, m.uses_quoted_identifier, t.is_ms_shipped
FROM sys.objects t LEFT JOIN sys.sql_modules m ON m.object_id=t.object_id
WHERE t.is_ms_shipped=0 AND t.type IN ('U','V','P','FN','IF','TF','TR','SO')
AND NOT (SCHEMA_NAME(t.schema_id)='dbo' AND t.name='__EFMigrationsHistory')
ORDER BY t.type,t.name FOR JSON PATH;
