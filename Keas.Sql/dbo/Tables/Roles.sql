CREATE TABLE [dbo].[Roles] (
    [Id]      INT           IDENTITY (1, 1) NOT NULL,
    [IsAdmin] BIT           NOT NULL,
    [Name]    NVARCHAR (50) NOT NULL,
    CONSTRAINT [PK_Roles] PRIMARY KEY CLUSTERED ([Id] ASC)
);

