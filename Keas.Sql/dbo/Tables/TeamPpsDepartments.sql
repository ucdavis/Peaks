CREATE TABLE [dbo].[TeamPpsDepartments] (
    [Id]                INT            IDENTITY (1, 1) NOT NULL,
    [PpsDepartmentCode] NVARCHAR (6)   NOT NULL,
    [DepartmentName]    NVARCHAR (250) NOT NULL,
    [TeamId]            INT            NOT NULL,
    CONSTRAINT [PK_TeamPpsDepartments] PRIMARY KEY CLUSTERED ([Id] ASC)
);

