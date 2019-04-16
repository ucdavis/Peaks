CREATE TABLE [dbo].[Workstations] (
    [Id]                      INT            IDENTITY (1, 1) NOT NULL,
    [Active]                  BIT            NOT NULL,
    [Name]                    NVARCHAR (64)  NOT NULL,
    [SpaceId]                 INT            NOT NULL,
    [Tags]                    NVARCHAR (100) NULL,
    [TeamId]                  INT            NOT NULL,
    [Type]                    NVARCHAR (MAX) NULL,
    [WorkstationAssignmentId] INT            NULL,
    [Notes] NVARCHAR(MAX) NULL, 
    CONSTRAINT [PK_Workstations] PRIMARY KEY CLUSTERED ([Id] ASC),
    CONSTRAINT [FK_Workstations_Spaces_SpaceId] FOREIGN KEY ([SpaceId]) REFERENCES [dbo].[Spaces] ([Id]) ON DELETE CASCADE,
    CONSTRAINT [FK_Workstations_Teams_TeamId] FOREIGN KEY ([TeamId]) REFERENCES [dbo].[Teams] ([Id]) ON DELETE CASCADE,
    CONSTRAINT [FK_Workstations_WorkstationAssignments_WorkstationAssignmentId] FOREIGN KEY ([WorkstationAssignmentId]) REFERENCES [dbo].[WorkstationAssignments] ([Id])
);






GO
CREATE NONCLUSTERED INDEX [IX_Workstations_WorkstationAssignmentId]
    ON [dbo].[Workstations]([WorkstationAssignmentId] ASC);


GO
CREATE NONCLUSTERED INDEX [IX_Workstations_TeamId]
    ON [dbo].[Workstations]([TeamId] ASC);


GO
CREATE NONCLUSTERED INDEX [IX_Workstations_SpaceId]
    ON [dbo].[Workstations]([SpaceId] ASC);


GO
CREATE NONCLUSTERED INDEX [IX_Workstations_Active]
    ON [dbo].[Workstations]([Active] DESC);


GO
CREATE NONCLUSTERED INDEX [IX_Workstations_Tags]
    ON [dbo].[Workstations]([Tags] ASC);

