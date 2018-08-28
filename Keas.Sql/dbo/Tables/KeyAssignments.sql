CREATE TABLE [dbo].[KeyAssignments] (
    [Id]              INT            IDENTITY (1, 1) NOT NULL,
    [ApprovedAt]      DATETIME2 (7)  NULL,
    [ConfirmedAt]     DATETIME2 (7)  NULL,
    [ExpiresAt]       DATETIME2 (7)  NOT NULL,
    [IsConfirmed]     BIT            NOT NULL,
    [PersonId]        INT            NOT NULL,
    [RequestedAt]     DATETIME2 (7)  NOT NULL,
    [RequestedById]   NVARCHAR (450) NULL,
    [RequestedByName] NVARCHAR (MAX) NULL,
    CONSTRAINT [PK_KeyAssignments] PRIMARY KEY CLUSTERED ([Id] ASC),
    CONSTRAINT [FK_KeyAssignments_People_PersonId] FOREIGN KEY ([PersonId]) REFERENCES [dbo].[People] ([Id]) ON DELETE CASCADE,
    CONSTRAINT [FK_KeyAssignments_Users_RequestedById] FOREIGN KEY ([RequestedById]) REFERENCES [dbo].[Users] ([Id])
);


GO
CREATE NONCLUSTERED INDEX [IX_KeyAssignments_RequestedById]
    ON [dbo].[KeyAssignments]([RequestedById] ASC);


GO
CREATE NONCLUSTERED INDEX [IX_KeyAssignments_PersonId]
    ON [dbo].[KeyAssignments]([PersonId] ASC);

