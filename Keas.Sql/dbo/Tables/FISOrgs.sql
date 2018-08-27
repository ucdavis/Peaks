CREATE TABLE [dbo].[FISOrgs] (
    [Id]      INT          IDENTITY (1, 1) NOT NULL,
    [Chart]   NVARCHAR (1) NOT NULL,
    [OrgCode] NVARCHAR (4) NOT NULL,
    [TeamId]  INT          NOT NULL,
    CONSTRAINT [PK_FISOrgs] PRIMARY KEY CLUSTERED ([Id] ASC),
    CONSTRAINT [FK_FISOrgs_Teams_TeamId] FOREIGN KEY ([TeamId]) REFERENCES [dbo].[Teams] ([Id]) ON DELETE CASCADE
);


GO
CREATE NONCLUSTERED INDEX [IX_FISOrgs_TeamId]
    ON [dbo].[FISOrgs]([TeamId] ASC);

