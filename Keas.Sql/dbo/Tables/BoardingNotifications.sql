CREATE TABLE [dbo].[BoardingNotifications]
(
	[Id] INT IDENTITY (1, 1) NOT NULL, 
    [Pending] BIT NOT NULL, 
    [NotificationEmail] NVARCHAR(256) NULL, 
    [PersonEmail] NVARCHAR(256) NOT NULL, 
    [PersonName] NVARCHAR(256) NOT NULL, 
    [PersonId] INT NULL, 
    [ActionDate] DATETIME2 NOT NULL, 
    [Actor] NVARCHAR(256) NOT NULL, 
    [Action] NVARCHAR(50) NOT NULL, 
    [TeamId] INT NULL, 
    [NotificationDate] DATETIME2 NULL, 
    CONSTRAINT [PK_BoardingNotifications] PRIMARY KEY CLUSTERED ([Id] ASC)
)
