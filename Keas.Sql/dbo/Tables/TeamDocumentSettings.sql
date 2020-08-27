CREATE TABLE [dbo].[TeamDocumentSettings] (
    [Id]                    INT            IDENTITY (1, 1) NOT NULL,
    [Name]                  NVARCHAR (64)  NOT NULL,
    [TemplateId]            NVARCHAR (64)  NOT NULL,
    [TeamId]                INT            NOT NULL,
    CONSTRAINT [PK_TeamDocumentSettings] PRIMARY KEY CLUSTERED ([Id] ASC),
    CONSTRAINT [FK_TeamDocumentSettings_Teams_TeamId] FOREIGN KEY ([TeamId]) REFERENCES [dbo].[Teams] ([Id]) ON DELETE CASCADE  
);

GO
CREATE NONCLUSTERED INDEX [IX_TeamDocumentSettings_TeamId]
    ON [dbo].[TeamDocumentSettings]([TeamId] ASC);
