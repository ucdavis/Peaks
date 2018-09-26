CREATE TABLE [dbo].[Spaces] (
    [Id]               INT            IDENTITY (1, 1) NOT NULL,
    [Active]           BIT            NOT NULL,
    [BldgKey]          NVARCHAR (MAX) NULL,
    [BldgName]         NVARCHAR (MAX) NULL,
    [ChartNum]         NVARCHAR (MAX) NULL,
    [DeptKey]          NVARCHAR (MAX) NULL,
    [DeptName]         NVARCHAR (MAX) NULL,
    [FloorKey]         NVARCHAR (MAX) NULL,
    [FloorName]        NVARCHAR (MAX) NULL,
    [OrgId]            NVARCHAR (MAX) NULL,
    [RoomCategoryCode] NVARCHAR (MAX) NULL,
    [RoomCategoryName] NVARCHAR (MAX) NULL,
    [RoomKey]          NVARCHAR (MAX) NULL,
    [RoomName]         NVARCHAR (MAX) NULL,
    [RoomNumber]       NVARCHAR (MAX) NULL,
    [Source]           NVARCHAR (MAX) NULL,
    CONSTRAINT [PK_Spaces] PRIMARY KEY CLUSTERED ([Id] ASC)
);

