CREATE TABLE [dbo].[WorkstationAttributes] (
    [Id]            INT            IDENTITY (1, 1) NOT NULL,
    [Key]           NVARCHAR (MAX) NULL,
    [Value]         NVARCHAR (MAX) NULL,
    [WorkstationId] INT            NOT NULL,
    CONSTRAINT [PK_WorkstationAttributes] PRIMARY KEY CLUSTERED ([Id] ASC),
    CONSTRAINT [FK_WorkstationAttributes_Workstations_WorkstationId] FOREIGN KEY ([WorkstationId]) REFERENCES [dbo].[Workstations] ([Id]) ON DELETE CASCADE
);


GO
CREATE NONCLUSTERED INDEX [IX_WorkstationAttributes_WorkstationId]
    ON [dbo].[WorkstationAttributes]([WorkstationId] ASC);

