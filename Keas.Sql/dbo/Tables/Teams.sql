CREATE TABLE [dbo].[Teams] (
    [Id]      INT              IDENTITY (1, 1) NOT NULL,
    [Name]    NVARCHAR (128)   NOT NULL,
    [Slug]    NVARCHAR (40)    NOT NULL,
    [ApiCode] UNIQUEIDENTIFIER NULL,
    [BoardingNotificationEmail] NVARCHAR(256) NULL, 
    CONSTRAINT [PK_Teams] PRIMARY KEY CLUSTERED ([Id] ASC)
);





