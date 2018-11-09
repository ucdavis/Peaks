CREATE TABLE [dbo].[KeySerials] (
    [Id]					INT            IDENTITY (1, 1) NOT NULL,
    [Active]				BIT            NOT NULL,
    [KeySerialAssignmentId] INT            NULL,
    [KeyId]					INT            NOT NULL,
    [Number]				NVARCHAR (MAX) NULL,
    CONSTRAINT [PK_KeySerials] PRIMARY KEY CLUSTERED ([Id] ASC),
    CONSTRAINT [FK_KeySerials_KeyAssignments_KeySerialAssignmentId] FOREIGN KEY ([KeySerialAssignmentId]) REFERENCES [dbo].[KeySerialAssignments] ([Id]),
    CONSTRAINT [FK_KeySerials_Keys_KeyId] FOREIGN KEY ([KeyId]) REFERENCES [dbo].[Keys] ([Id]) ON DELETE CASCADE
);


GO
CREATE NONCLUSTERED INDEX [IX_KeySerials_KeyId]
    ON [dbo].[KeySerials]([KeyId] ASC);


GO
CREATE NONCLUSTERED INDEX [IX_KeySerials_KeyAssignmentId]
    ON [dbo].[KeySerials]([KeySerialAssignmentId] ASC);

