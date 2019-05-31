CREATE TABLE [dbo].[GroupPermissions]
(
    [Id]		INT            IDENTITY (1, 1) NOT NULL,
    [GroupId]	INT            NOT NULL,
    [UserId]	NVARCHAR (450) NOT NULL,
    CONSTRAINT	[PK_GroupPermissions] PRIMARY KEY CLUSTERED ([Id] ASC),
    CONSTRAINT	[FK_GroupPermissions_Groups_GroupId] FOREIGN KEY ([GroupId]) REFERENCES [dbo].[Groups] ([Id]) ON DELETE CASCADE,
    CONSTRAINT	[FK_GroupPermissions_Users_UserId] FOREIGN KEY ([UserId]) REFERENCES [dbo].[Users] ([Id]) ON DELETE CASCADE
)
