CREATE TABLE [dbo].[EquipmentAssignments] (
    [Id]                   INT            IDENTITY (1, 1) NOT NULL,
    [ApprovedAt]           DATETIME2 (7)  NULL,
    [ConfirmedAt]          DATETIME2 (7)  NULL,
    [ExpiresAt]            DATETIME2 (7)  NOT NULL,
    [IsConfirmed]          BIT            NOT NULL,
    [NextNotificationDate] DATETIME2 (7)  NULL,
    [PersonId]             INT            NOT NULL,
    [RequestedAt]          DATETIME2 (7)  NOT NULL,
    [RequestedById]        NVARCHAR (450) NULL,
    [RequestedByName]      NVARCHAR (MAX) NULL,
    CONSTRAINT [PK_EquipmentAssignments] PRIMARY KEY CLUSTERED ([Id] ASC),
    CONSTRAINT [FK_EquipmentAssignments_People_PersonId] FOREIGN KEY ([PersonId]) REFERENCES [dbo].[People] ([Id]) ON DELETE CASCADE,
    CONSTRAINT [FK_EquipmentAssignments_Users_RequestedById] FOREIGN KEY ([RequestedById]) REFERENCES [dbo].[Users] ([Id])
);




GO
CREATE NONCLUSTERED INDEX [IX_EquipmentAssignments_RequestedById]
    ON [dbo].[EquipmentAssignments]([RequestedById] ASC);


GO
CREATE NONCLUSTERED INDEX [IX_EquipmentAssignments_PersonId]
    ON [dbo].[EquipmentAssignments]([PersonId] ASC);

