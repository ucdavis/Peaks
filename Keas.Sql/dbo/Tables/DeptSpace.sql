CREATE TABLE [dbo].[DeptSpace] (
    [Space_Acctng_Dept_Key]    VARCHAR (150) NULL,
    [Bldg_Key]                 VARCHAR (150) NULL,
    [Floor_Key]                VARCHAR (150) NULL,
    [Room_Key]                 VARCHAR (150) NULL,
    [Suite]                    VARCHAR (150) NULL,
    [Room]                     VARCHAR (150) NULL,
    [Suffix]                   VARCHAR (150) NULL,
    [Space]                    VARCHAR (150) NULL,
    [Room_Share_Square_Feet]   INT           NULL,
    [Room_Share_Percent]       VARCHAR (150) NULL,
    [Room_Share_Use_Code]      VARCHAR (150) NULL,
    [Room_Share_Use_Name]      VARCHAR (150) NULL,
    [room_share_use_type_code] VARCHAR (150) NULL,
    [room_share_use_type_name] VARCHAR (150) NULL,
    [Space_Key]                VARCHAR (150) NULL,
    [Bldg_Asset_Code]          VARCHAR (150) NULL,
    [Room_Share_Station_Count] INT           NULL,
    [Room_Name]                VARCHAR (150) NULL
);




GO
CREATE UNIQUE NONCLUSTERED INDEX [DeptSpace_SpaceBldgKeyFloorRoomKey_UDX]
    ON [dbo].[DeptSpace]([Space_Key] ASC);

