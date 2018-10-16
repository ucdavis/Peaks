CREATE TABLE [dbo].[AccessAssignments] (
    [Id]                   INT            IDENTITY (1, 1) NOT NULL,
    [AccessId]             INT            NOT NULL,
    [ApprovedAt]           DATETIME2 (7)  NULL,
    [ConfirmedAt]          DATETIME2 (7)  NULL,
    [ExpiresAt]            DATETIME2 (7)  NOT NULL,
    [IsConfirmed]          BIT            NOT NULL,
    [NextNotificationDate] DATETIME2 (7)  NULL,
    [PersonId]             INT            NOT NULL,
    [RequestedAt]          DATETIME2 (7)  NOT NULL,
    [RequestedById]        NVARCHAR (450) NULL,
    [RequestedByName]      NVARCHAR (MAX) NULL,
    CONSTRAINT [PK_AccessAssignments] PRIMARY KEY CLUSTERED ([Id] ASC),
    CONSTRAINT [FK_AccessAssignments_Access_AccessId] FOREIGN KEY ([AccessId]) REFERENCES [dbo].[Access] ([Id]),
    CONSTRAINT [FK_AccessAssignments_People_PersonId] FOREIGN KEY ([PersonId]) REFERENCES [dbo].[People] ([Id]) ON DELETE CASCADE,
    CONSTRAINT [FK_AccessAssignments_Users_RequestedById] FOREIGN KEY ([RequestedById]) REFERENCES [dbo].[Users] ([Id])
);




GO
CREATE NONCLUSTERED INDEX [IX_AccessAssignments_RequestedById]
    ON [dbo].[AccessAssignments]([RequestedById] ASC);


GO



GO



GO
CREATE NONCLUSTERED INDEX [IX_AccessAssignments_AccessId]
    ON [dbo].[AccessAssignments]([AccessId] ASC);


GO
CREATE NONCLUSTERED INDEX [IX_AccessAssignments_PersonId]
    ON [dbo].[AccessAssignments]([PersonId] ASC);

