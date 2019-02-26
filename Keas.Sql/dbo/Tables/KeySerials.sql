CREATE TABLE [dbo].[KeySerials] (
    [Id]					INT            IDENTITY (1, 1) NOT NULL,
    [Active]				BIT            NOT NULL,
    [KeySerialAssignmentId] INT            NULL,
    [KeyId]					INT            NOT NULL,
    [Number]				NVARCHAR (MAX) NULL,
    [Status]				NVARCHAR (50)  NOT NULL DEFAULT 'Active', 
	[Group]                 NVARCHAR (32)  NULL,
    [Name]                  NVARCHAR (64)  NOT NULL,
    [Tags]                  NVARCHAR (MAX) NULL,
    [TeamId]				INT            NOT NULL,
    [Notes] NVARCHAR(MAX) NULL, 
    CONSTRAINT [PK_KeySerials] PRIMARY KEY CLUSTERED ([Id] ASC),
    CONSTRAINT [FK_KeySerials_Keys_KeyId] FOREIGN KEY ([KeyId]) REFERENCES [dbo].[Keys] ([Id]) ON DELETE CASCADE,
    CONSTRAINT [FK_KeySerials_Teams_TeamId] FOREIGN KEY ([TeamId]) REFERENCES [dbo].[Teams] ([Id]),
);


GO
CREATE NONCLUSTERED INDEX [IX_KeySerials_KeyId]
    ON [dbo].[KeySerials]([KeyId] ASC);


GO
CREATE NONCLUSTERED INDEX [IX_KeySerials_KeyAssignmentId]
    ON [dbo].[KeySerials]([KeySerialAssignmentId] ASC);


GO
CREATE UNIQUE INDEX [UX_KeySerials_KeySerialAssignmentId]
	ON [dbo].[KeySerials] ([KeySerialAssignmentId])
	WHERE [KeySerialAssignmentId] IS NOT NULL;

GO
