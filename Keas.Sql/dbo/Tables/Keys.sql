CREATE TABLE [dbo].[Keys] (
    [Id]     INT            IDENTITY (1, 1) NOT NULL,
    [Active] BIT            NOT NULL,
    [Group]  NVARCHAR (32)  NULL,
    [Name]   NVARCHAR (64)  NOT NULL,
    [Number] NVARCHAR (MAX) NULL,
    [Tags]   NVARCHAR (MAX) NULL,
    [TeamId] INT            NOT NULL,
    CONSTRAINT [PK_Keys] PRIMARY KEY CLUSTERED ([Id] ASC),
    CONSTRAINT [FK_Keys_Teams_TeamId] FOREIGN KEY ([TeamId]) REFERENCES [dbo].[Teams] ([Id]) ON DELETE CASCADE
);


GO
CREATE NONCLUSTERED INDEX [IX_Keys_TeamId]
    ON [dbo].[Keys]([TeamId] ASC);

