CREATE TABLE [dbo].[TeamApiCodes]
(
	[Id]     INT            IDENTITY (1, 1) NOT NULL,
	[TeamId] INT            NOT NULL,
	[ApiCode] UNIQUEIDENTIFIER NOT NULL,
	CONSTRAINT [FK_TeamApiCode_Teams_TeamId] FOREIGN KEY ([TeamId]) REFERENCES [dbo].[Teams] ([Id]) ON DELETE CASCADE,
)
