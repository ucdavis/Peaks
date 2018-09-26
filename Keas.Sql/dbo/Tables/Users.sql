CREATE TABLE [dbo].[Users] (
    [Id]        NVARCHAR (450) NOT NULL,
    [Iam]       NVARCHAR (450) NULL,
    [Email]     NVARCHAR (256) NOT NULL,
    [FirstName] NVARCHAR (50)  NOT NULL,
    [LastName]  NVARCHAR (50)  NOT NULL,
    CONSTRAINT [PK_Users] PRIMARY KEY CLUSTERED ([Id] ASC)
);

