CREATE TABLE [dbo].[LoadingSpaces] (
    [DeptKey]          VARCHAR (11)  NOT NULL,
    [BldgKey]          VARCHAR (12)  NOT NULL,
    [FloorKey]         VARCHAR (13)  NOT NULL,
    [RoomKey]          VARCHAR (14)  NOT NULL,
    [ChartNum]         VARCHAR (2)   NULL,
    [OrgId]            VARCHAR (4)   NULL,
    [DeptName]         VARCHAR (100) NULL,
    [BldgName]         VARCHAR (100) NULL,
    [FloorName]        VARCHAR (25)  NULL,
    [RoomNumber]       VARCHAR (10)  NULL,
    [RoomName]         VARCHAR (150) NULL,
    [RoomCategoryName] VARCHAR (20)  NULL,
    [RoomCategoryCode] VARCHAR (5)   NULL,
    [Source]           VARCHAR (100) NULL,
    [Active]           BIT           NULL,
    CONSTRAINT [PK_LoadingSpace] PRIMARY KEY CLUSTERED ([DeptKey] ASC, [RoomKey] ASC)
);

