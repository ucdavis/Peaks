CREATE TABLE [dbo].[SystemPermissions] (
    [Id]     INT            IDENTITY (1, 1) NOT NULL,
    [RoleId] INT            NOT NULL,
    [UserId] NVARCHAR (450) NOT NULL,
    CONSTRAINT [PK_SystemPermissions] PRIMARY KEY CLUSTERED ([Id] ASC),
    CONSTRAINT [FK_SystemPermissions_Roles_RoleId] FOREIGN KEY ([RoleId]) REFERENCES [dbo].[Roles] ([Id]) ON DELETE CASCADE,
    CONSTRAINT [FK_SystemPermissions_Users_UserId] FOREIGN KEY ([UserId]) REFERENCES [dbo].[Users] ([Id]) ON DELETE CASCADE
);


GO
CREATE NONCLUSTERED INDEX [IX_SystemPermissions_UserId]
    ON [dbo].[SystemPermissions]([UserId] ASC);


GO
CREATE NONCLUSTERED INDEX [IX_SystemPermissions_RoleId]
    ON [dbo].[SystemPermissions]([RoleId] ASC);

