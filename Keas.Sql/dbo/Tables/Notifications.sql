CREATE TABLE [dbo].[Notifications] (
    [Id]              INT            IDENTITY (1, 1) NOT NULL,
    [DateTimeCreated] DATETIME2 (7)  NOT NULL,
    [DateTimeSent]    DATETIME2 (7)  NULL,
    [Details]         NVARCHAR (MAX) NULL,
    [HistoryId]       INT            NOT NULL,
    [Pending]         BIT            NOT NULL,
    [Status]          NVARCHAR (MAX) NULL,
    [UserId]          NVARCHAR (450) NULL,
    [NeedsAccept]     BIT            CONSTRAINT [DF_Notifications_NeedsAccept] DEFAULT ((0)) NOT NULL,
    [TeamId]          INT            NULL,
    CONSTRAINT [PK_Notifications] PRIMARY KEY CLUSTERED ([Id] ASC),
    CONSTRAINT [FK_Notifications_Histories_HistoryId] FOREIGN KEY ([HistoryId]) REFERENCES [dbo].[Histories] ([Id]) ON DELETE CASCADE,
    CONSTRAINT [FK_Notifications_Users_UserId] FOREIGN KEY ([UserId]) REFERENCES [dbo].[Users] ([Id])
);












GO
CREATE NONCLUSTERED INDEX [IX_Notifications_UserId]
    ON [dbo].[Notifications]([UserId] ASC);


GO
CREATE NONCLUSTERED INDEX [IX_Notifications_HistoryId]
    ON [dbo].[Notifications]([HistoryId] ASC);


GO
CREATE NONCLUSTERED INDEX [IX_Notifications_Pending_UserId] ON [dbo].[Notifications] ([Pending] DESC, [UserId] ASC) INCLUDE ([DateTimeCreated], [DateTimeSent], [Details], [HistoryId], [NeedsAccept], [TeamId])

GO
CREATE NONCLUSTERED INDEX [IX_Notifications_Team_DateCreated] ON [dbo].[Notifications] ([TeamId] ASC, [DateTimeCreated] DESC) INCLUDE ([DateTimeSent], [Details], [HistoryId], [NeedsAccept])

