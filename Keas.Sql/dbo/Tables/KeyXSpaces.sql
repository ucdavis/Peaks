CREATE TABLE [dbo].[KeyXSpaces] (
    [Id]      INT IDENTITY (1, 1) NOT NULL,
    [KeyId]   INT NOT NULL,
    [SpaceId] INT NOT NULL,
    CONSTRAINT [PK_KeyXSpaces] PRIMARY KEY CLUSTERED ([Id] ASC),
    CONSTRAINT [FK_KeyXSpaces_Keys_KeyId] FOREIGN KEY ([KeyId]) REFERENCES [dbo].[Keys] ([Id]) ON DELETE CASCADE,
    CONSTRAINT [FK_KeyXSpaces_Spaces_SpaceId] FOREIGN KEY ([SpaceId]) REFERENCES [dbo].[Spaces] ([Id]) ON DELETE CASCADE
);




GO
CREATE NONCLUSTERED INDEX [IX_KeyXSpaces_SpaceId]
    ON [dbo].[KeyXSpaces]([SpaceId] ASC);


GO
CREATE NONCLUSTERED INDEX [IX_KeyXSpaces_KeyId]
    ON [dbo].[KeyXSpaces]([KeyId] ASC);

