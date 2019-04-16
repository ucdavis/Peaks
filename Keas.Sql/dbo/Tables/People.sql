CREATE TABLE [dbo].[People] (
    [Id]           INT            IDENTITY (1, 1) NOT NULL,
    [Active]       BIT            NOT NULL,
    [Category]     NVARCHAR (MAX) NULL,
    [Email]        NVARCHAR (256) NOT NULL,
    [EndDate]      DATETIME2 (7)  NULL,
    [FirstName]    NVARCHAR (50)  NOT NULL,
    [HomePhone]    NVARCHAR (MAX) NULL,
    [LastName]     NVARCHAR (50)  NOT NULL,
    [Notes]        NVARCHAR (MAX) NULL,
    [StartDate]    DATETIME2 (7)  NULL,
    [SupervisorId] INT            NULL,
    [Tags]         NVARCHAR (MAX) NULL,
    [TeamId]       INT            NOT NULL,
    [TeamPhone]    NVARCHAR (MAX) NULL,
    [Title]        NVARCHAR (MAX) NULL,
    [UserId]       NVARCHAR (450) NULL,
    CONSTRAINT [PK_People] PRIMARY KEY CLUSTERED ([Id] ASC),
    CONSTRAINT [FK_People_People_SupervisorId] FOREIGN KEY ([SupervisorId]) REFERENCES [dbo].[People] ([Id]),
    CONSTRAINT [FK_People_Teams_TeamId] FOREIGN KEY ([TeamId]) REFERENCES [dbo].[Teams] ([Id]) ON DELETE CASCADE,
    CONSTRAINT [FK_People_Users_UserId] FOREIGN KEY ([UserId]) REFERENCES [dbo].[Users] ([Id])
);






GO
CREATE NONCLUSTERED INDEX [IX_People_UserId]
    ON [dbo].[People]([UserId] ASC);


GO
CREATE NONCLUSTERED INDEX [IX_People_TeamId]
    ON [dbo].[People]([TeamId] ASC);


GO
CREATE NONCLUSTERED INDEX [IX_People_SupervisorId]
    ON [dbo].[People]([SupervisorId] ASC);

