CREATE TABLE [dbo].[AttributeKeys]
(
	[Id]			INT				NOT NULL PRIMARY KEY IDENTITY, 
	[TeamId]		INT				NULL, 
	[Key]			NVARCHAR(MAX)	NOT NULL, 
	[Description]	NVARCHAR(50)	NOT NULL
)
