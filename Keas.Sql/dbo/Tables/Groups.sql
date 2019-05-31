CREATE TABLE [dbo].[Groups]
(
	[Id]      INT              IDENTITY (1, 1) NOT NULL,
    [Name]    NVARCHAR (128)   NOT NULL,
	CONSTRAINT [PK_Groups] PRIMARY KEY CLUSTERED ([Id] ASC)
)
