CREATE TABLE [dbo].[Equipment] (
    [Id]                    INT            IDENTITY (1, 1) NOT NULL,
    [Active]                BIT            NOT NULL,
    [EquipmentAssignmentId] INT            NULL,
    [Make]                  NVARCHAR (MAX) NULL,
    [Model]                 NVARCHAR (MAX) NULL,
    [Name]                  NVARCHAR (64)  NOT NULL,
    [SerialNumber]          NVARCHAR (MAX) NULL,
    [SpaceId]               INT            NULL,
    [Tags]                  NVARCHAR (MAX) NULL,
    [TeamId]                INT            NOT NULL,
    [Type]                  NVARCHAR (MAX) NULL,
    [Notes] NVARCHAR(MAX) NULL, 
    CONSTRAINT [PK_Equipment] PRIMARY KEY CLUSTERED ([Id] ASC),
    CONSTRAINT [FK_Equipment_EquipmentAssignments_EquipmentAssignmentId] FOREIGN KEY ([EquipmentAssignmentId]) REFERENCES [dbo].[EquipmentAssignments] ([Id]),
    CONSTRAINT [FK_Equipment_Spaces_SpaceId] FOREIGN KEY ([SpaceId]) REFERENCES [dbo].[Spaces] ([Id]),
    CONSTRAINT [FK_Equipment_Teams_TeamId] FOREIGN KEY ([TeamId]) REFERENCES [dbo].[Teams] ([Id]) ON DELETE CASCADE
);




GO
CREATE NONCLUSTERED INDEX [IX_Equipment_TeamId]
    ON [dbo].[Equipment]([TeamId] ASC);


GO
CREATE NONCLUSTERED INDEX [IX_Equipment_SpaceId]
    ON [dbo].[Equipment]([SpaceId] ASC);


GO
CREATE NONCLUSTERED INDEX [IX_Equipment_EquipmentAssignmentId]
    ON [dbo].[Equipment]([EquipmentAssignmentId] ASC);


GO
CREATE NONCLUSTERED INDEX [IX_Equipment_Active]
    ON [dbo].[Equipment]([Active] DESC);

