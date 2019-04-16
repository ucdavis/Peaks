CREATE TABLE [dbo].[Access] (
    [Id]     INT            IDENTITY (1, 1) NOT NULL,
    [Active] BIT            NOT NULL,
    [Name]   NVARCHAR (64)  NOT NULL,
    [Tags]   NVARCHAR (MAX) NULL,
    [TeamId] INT            NOT NULL,
    [Notes] NVARCHAR(MAX) NULL, 
    CONSTRAINT [PK_Access] PRIMARY KEY CLUSTERED ([Id] ASC),
    CONSTRAINT [FK_Access_Teams_TeamId] FOREIGN KEY ([TeamId]) REFERENCES [dbo].[Teams] ([Id]) ON DELETE CASCADE
);


GO
CREATE NONCLUSTERED INDEX [IX_Access_TeamId]
    ON [dbo].[Access]([TeamId] ASC);

