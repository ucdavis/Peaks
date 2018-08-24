CREATE TABLE [dbo].[Users] (
    [Id]        NVARCHAR (450) NOT NULL,
    [Email]     NVARCHAR (256) NOT NULL,
    [FirstName] NVARCHAR (50)  NULL,
    [LastName]  NVARCHAR (50)  NULL,
    [Name]      NVARCHAR (256) NOT NULL,
    CONSTRAINT [PK_Users] PRIMARY KEY CLUSTERED ([Id] ASC)
);

