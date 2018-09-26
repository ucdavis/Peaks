CREATE TABLE [dbo].[Serials] (
    [Id]              INT            IDENTITY (1, 1) NOT NULL,
    [Active]          BIT            NOT NULL,
    [KeyAssignmentId] INT            NULL,
    [KeyId]           INT            NOT NULL,
    [Number]          NVARCHAR (MAX) NULL,
    CONSTRAINT [PK_Serials] PRIMARY KEY CLUSTERED ([Id] ASC),
    CONSTRAINT [FK_Serials_KeyAssignments_KeyAssignmentId] FOREIGN KEY ([KeyAssignmentId]) REFERENCES [dbo].[KeyAssignments] ([Id]),
    CONSTRAINT [FK_Serials_Keys_KeyId] FOREIGN KEY ([KeyId]) REFERENCES [dbo].[Keys] ([Id]) ON DELETE CASCADE
);


GO
CREATE NONCLUSTERED INDEX [IX_Serials_KeyId]
    ON [dbo].[Serials]([KeyId] ASC);


GO
CREATE NONCLUSTERED INDEX [IX_Serials_KeyAssignmentId]
    ON [dbo].[Serials]([KeyAssignmentId] ASC);

