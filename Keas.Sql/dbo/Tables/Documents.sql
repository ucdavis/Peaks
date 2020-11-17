CREATE TABLE [dbo].[Documents] (
    [Id]                    INT            IDENTITY (1, 1) NOT NULL,
    [Active]                BIT            NOT NULL,
    [Name]                  NVARCHAR (64)  NOT NULL,
    [EnvelopeId]            NVARCHAR (64)  NOT NULL,
    [TemplateId]            NVARCHAR (64)  NOT NULL,
    [Status]                NVARCHAR (64)  NOT NULL,
    [PersonId]              INT            NULL,
    [Notes]					NVARCHAR(MAX)  NULL, 
    [Tags]                  NVARCHAR (MAX) NULL,
    [TeamId]                INT            NOT NULL,
    [CreatedAt]             DATETIME2 (7)  NOT NULL,
    [CompletedAt]           DATETIME2 (7)  NULL,
    [AccountId] NVARCHAR(64) NULL, 
    [ApiBasePath] NVARCHAR(64) NULL, 
    CONSTRAINT [PK_Documents] PRIMARY KEY CLUSTERED ([Id] ASC),
    CONSTRAINT [FK_Documents_People_PersonId] FOREIGN KEY ([PersonId]) REFERENCES [dbo].[People] ([Id]),
    CONSTRAINT [FK_Documents_Teams_TeamId] FOREIGN KEY ([TeamId]) REFERENCES [dbo].[Teams] ([Id]) ON DELETE CASCADE  
);

GO
CREATE NONCLUSTERED INDEX [IX_Documents_TeamId]
    ON [dbo].[Documents]([TeamId] ASC);

GO
CREATE NONCLUSTERED INDEX [IX_Documents_Active]
    ON [dbo].[Documents]([Active] DESC);

GO
CREATE NONCLUSTERED INDEX [IX_Documents_PersonId]
    ON [dbo].[Documents]([PersonId] ASC);
