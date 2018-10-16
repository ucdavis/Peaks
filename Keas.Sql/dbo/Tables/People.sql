CREATE TABLE [dbo].[People] (
    [Id]        INT            IDENTITY (1, 1) NOT NULL,
    [Active]    BIT            NOT NULL,
    [Email]     NVARCHAR (256) NOT NULL,
    [FirstName] NVARCHAR (50)  NOT NULL,
    [Group]     NVARCHAR (MAX) NULL,
    [HomePhone] NVARCHAR (MAX) NULL,
    [LastName]  NVARCHAR (50)  NOT NULL,
    [Tags]      NVARCHAR (MAX) NULL,
    [TeamId]    INT            NOT NULL,
    [TeamPhone] NVARCHAR (MAX) NULL,
    [Title]     NVARCHAR (MAX) NULL,
    [UserId]    NVARCHAR (450) NULL,
    CONSTRAINT [PK_People] PRIMARY KEY CLUSTERED ([Id] ASC),
    CONSTRAINT [FK_People_Teams_TeamId] FOREIGN KEY ([TeamId]) REFERENCES [dbo].[Teams] ([Id]) ON DELETE CASCADE,
    CONSTRAINT [FK_People_Users_UserId] FOREIGN KEY ([UserId]) REFERENCES [dbo].[Users] ([Id])
);




GO
CREATE NONCLUSTERED INDEX [IX_People_UserId]
    ON [dbo].[People]([UserId] ASC);


GO
CREATE NONCLUSTERED INDEX [IX_People_TeamId]
    ON [dbo].[People]([TeamId] ASC);

