CREATE TABLE [dbo].[WorkstationAssignments] (
    [Id]                   INT            IDENTITY (1, 1) NOT NULL,
    [ApprovedAt]           DATETIME2 (7)  NULL,
    [ConfirmedAt]          DATETIME2 (7)  NULL,
    [ExpiresAt]            DATETIME2 (7)  NOT NULL,
    [IsConfirmed]          BIT            NOT NULL,
    [PersonId]             INT            NOT NULL,
    [RequestedAt]          DATETIME2 (7)  NOT NULL,
    [RequestedById]        NVARCHAR (450) NULL,
    [RequestedByName]      NVARCHAR (MAX) NULL,
    [NextNotificationDate] DATETIME2 (7)  NULL,
    CONSTRAINT [PK_WorkstationAssignments] PRIMARY KEY CLUSTERED ([Id] ASC),
    CONSTRAINT [FK_WorkstationAssignments_People_PersonId] FOREIGN KEY ([PersonId]) REFERENCES [dbo].[People] ([Id]) ON DELETE CASCADE,
    CONSTRAINT [FK_WorkstationAssignments_Users_RequestedById] FOREIGN KEY ([RequestedById]) REFERENCES [dbo].[Users] ([Id])
);






GO
CREATE NONCLUSTERED INDEX [IX_WorkstationAssignments_RequestedById]
    ON [dbo].[WorkstationAssignments]([RequestedById] ASC);


GO
CREATE NONCLUSTERED INDEX [IX_WorkstationAssignments_PersonId]
    ON [dbo].[WorkstationAssignments]([PersonId] ASC);

