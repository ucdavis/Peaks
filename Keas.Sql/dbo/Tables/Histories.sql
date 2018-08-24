CREATE TABLE [dbo].[Histories] (
    [Id]            INT            IDENTITY (1, 1) NOT NULL,
    [AccessId]      INT            NULL,
    [ActedDate]     DATETIME2 (7)  NOT NULL,
    [ActionType]    NVARCHAR (MAX) NULL,
    [ActorId]       NVARCHAR (450) NULL,
    [AssetType]     NVARCHAR (MAX) NULL,
    [Description]   NVARCHAR (MAX) NOT NULL,
    [EquipmentId]   INT            NULL,
    [KeyId]         INT            NULL,
    [SerialId]      INT            NULL,
    [TargetId]      INT            NULL,
    [WorkstationId] INT            NULL,
    CONSTRAINT [PK_Histories] PRIMARY KEY CLUSTERED ([Id] ASC),
    CONSTRAINT [FK_Histories_Access_AccessId] FOREIGN KEY ([AccessId]) REFERENCES [dbo].[Access] ([Id]),
    CONSTRAINT [FK_Histories_Equipment_EquipmentId] FOREIGN KEY ([EquipmentId]) REFERENCES [dbo].[Equipment] ([Id]),
    CONSTRAINT [FK_Histories_Keys_KeyId] FOREIGN KEY ([KeyId]) REFERENCES [dbo].[Keys] ([Id]),
    CONSTRAINT [FK_Histories_People_TargetId] FOREIGN KEY ([TargetId]) REFERENCES [dbo].[People] ([Id]),
    CONSTRAINT [FK_Histories_Serials_SerialId] FOREIGN KEY ([SerialId]) REFERENCES [dbo].[Serials] ([Id]),
    CONSTRAINT [FK_Histories_Users_ActorId] FOREIGN KEY ([ActorId]) REFERENCES [dbo].[Users] ([Id]),
    CONSTRAINT [FK_Histories_Workstations_WorkstationId] FOREIGN KEY ([WorkstationId]) REFERENCES [dbo].[Workstations] ([Id])
);


GO
CREATE NONCLUSTERED INDEX [IX_Histories_WorkstationId]
    ON [dbo].[Histories]([WorkstationId] ASC);


GO
CREATE NONCLUSTERED INDEX [IX_Histories_TargetId]
    ON [dbo].[Histories]([TargetId] ASC);


GO
CREATE NONCLUSTERED INDEX [IX_Histories_SerialId]
    ON [dbo].[Histories]([SerialId] ASC);


GO
CREATE NONCLUSTERED INDEX [IX_Histories_KeyId]
    ON [dbo].[Histories]([KeyId] ASC);


GO
CREATE NONCLUSTERED INDEX [IX_Histories_EquipmentId]
    ON [dbo].[Histories]([EquipmentId] ASC);


GO
CREATE NONCLUSTERED INDEX [IX_Histories_ActorId]
    ON [dbo].[Histories]([ActorId] ASC);


GO
CREATE NONCLUSTERED INDEX [IX_Histories_AccessId]
    ON [dbo].[Histories]([AccessId] ASC);

