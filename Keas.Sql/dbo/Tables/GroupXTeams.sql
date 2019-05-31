CREATE TABLE [dbo].[GroupXTeams]
(
    [Id]		INT IDENTITY (1, 1) NOT NULL,
    [GroupId]   INT NOT NULL,
    [TeamId]	INT NOT NULL,
    CONSTRAINT	[PK_GroupXTeams] PRIMARY KEY CLUSTERED ([Id] ASC),
    CONSTRAINT	[FK_GroupXTeams_Groups_GroupId] FOREIGN KEY ([GroupId]) REFERENCES [dbo].[Groups] ([Id]) ON DELETE CASCADE,
    CONSTRAINT	[FK_GroupXTeams_Teams_TeamId] FOREIGN KEY ([TeamId]) REFERENCES [dbo].[Teams] ([Id]) ON DELETE CASCADE
)
