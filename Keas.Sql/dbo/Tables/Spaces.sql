CREATE TABLE [dbo].[Spaces] (
    [Id]               INT            IDENTITY (1, 1) NOT NULL,
    [Active]           BIT            NOT NULL,
    [BldgKey]          NVARCHAR (25)  NULL,
    [BldgName]         NVARCHAR (128) NULL,
    [ChartNum]         NVARCHAR (2)   NULL,
    [DeptKey]          NVARCHAR (25)  NULL,
    [DeptName]         NVARCHAR (128) NULL,
    [FloorKey]         NVARCHAR (25)  NULL,
    [FloorName]        NVARCHAR (128) NULL,
    [OrgId]            NVARCHAR (10)  NULL,
    [RoomCategoryCode] NVARCHAR (5)   NULL,
    [RoomCategoryName] NVARCHAR (128) NULL,
    [RoomKey]          NVARCHAR (25)  NULL,
    [RoomName]         NVARCHAR (200) NULL,
    [RoomNumber]       NVARCHAR (25)  NULL,
    [SqFt]             INT            NULL,
    [Source]           NVARCHAR (50)  NULL,
    CONSTRAINT [PK_Spaces] PRIMARY KEY CLUSTERED ([Id] ASC)
);




GO
CREATE NONCLUSTERED INDEX [IX_Spaces_OrgId_ActiveBldgKeyBldgNmChartNumDeptKeyDeptNmFloorKeyFloorNmRmCatCdRmCatNmRmKeyRmNumSrc]
    ON [dbo].[Spaces]([OrgId] ASC)
    INCLUDE([Active], [BldgKey], [BldgName], [ChartNum], [DeptKey], [RoomName], [RoomNumber], [Source], [DeptName], [FloorKey], [FloorName], [RoomCategoryCode], [RoomCategoryName], [RoomKey]);


GO
CREATE NONCLUSTERED INDEX [IX_Spaces_OrgId]
    ON [dbo].[Spaces]([OrgId] ASC);


GO
CREATE NONCLUSTERED INDEX [IX_Spaces_Active]
    ON [dbo].[Spaces]([Active] DESC);

