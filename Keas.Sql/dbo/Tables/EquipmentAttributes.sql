CREATE TABLE [dbo].[EquipmentAttributes] (
    [Id]          INT            IDENTITY (1, 1) NOT NULL,
    [EquipmentId] INT            NOT NULL,
    [Key]         NVARCHAR (MAX) NULL,
    [Value]       NVARCHAR (MAX) NULL,
    CONSTRAINT [PK_EquipmentAttributes] PRIMARY KEY CLUSTERED ([Id] ASC),
    CONSTRAINT [FK_EquipmentAttributes_Equipment_EquipmentId] FOREIGN KEY ([EquipmentId]) REFERENCES [dbo].[Equipment] ([Id]) ON DELETE CASCADE
);


GO
CREATE NONCLUSTERED INDEX [IX_EquipmentAttributes_EquipmentId]
    ON [dbo].[EquipmentAttributes]([EquipmentId] ASC);

