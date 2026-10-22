-- Production schema captured 2026-10-21. Historical backup tables and the Azure automatic index are excluded.
CREATE TABLE [dbo].[Access] (
    [Id]     INT            IDENTITY (1, 1) NOT NULL,
    [Active] BIT            NOT NULL,
    [Name]   NVARCHAR (64)  NOT NULL,
    [Tags]   NVARCHAR (MAX) NULL,
    [TeamId] INT            NOT NULL,
    [Notes]  NVARCHAR (MAX) NULL,
    CONSTRAINT [PK_Access] PRIMARY KEY CLUSTERED ([Id] ASC)
);


GO

CREATE NONCLUSTERED INDEX [IX_Access_TeamId]
    ON [dbo].[Access]([TeamId] ASC);


GO

CREATE TABLE [dbo].[AccessAssignments] (
    [Id]                   INT            IDENTITY (1, 1) NOT NULL,
    [AccessId]             INT            NOT NULL,
    [ApprovedAt]           DATETIME2 (7)  NULL,
    [ConfirmedAt]          DATETIME2 (7)  NULL,
    [ExpiresAt]            DATETIME2 (7)  NOT NULL,
    [IsConfirmed]          BIT            NOT NULL,
    [NextNotificationDate] DATETIME2 (7)  NULL,
    [PersonId]             INT            NOT NULL,
    [RequestedAt]          DATETIME2 (7)  NOT NULL,
    [RequestedById]        NVARCHAR (450) NULL,
    [RequestedByName]      NVARCHAR (MAX) NULL,
    CONSTRAINT [PK_AccessAssignments] PRIMARY KEY CLUSTERED ([Id] ASC)
);


GO

CREATE NONCLUSTERED INDEX [IX_AccessAssignments_PersonId]
    ON [dbo].[AccessAssignments]([PersonId] ASC);


GO

CREATE NONCLUSTERED INDEX [IX_AccessAssignments_AccessId]
    ON [dbo].[AccessAssignments]([AccessId] ASC);


GO

CREATE NONCLUSTERED INDEX [IX_AccessAssignments_RequestedById]
    ON [dbo].[AccessAssignments]([RequestedById] ASC);


GO

CREATE TABLE [dbo].[Bldg] (
    [Bldg_Key]             VARCHAR (150)  NULL,
    [Official_Name]        VARCHAR (300)  NULL,
    [Primary_Display_Name] VARCHAR (300)  NULL,
    [Asset_Number]         VARCHAR (150)  NULL,
    [Facilities_Code]      VARCHAR (150)  NULL,
    [UCDHS_Bldg_Num]       VARCHAR (150)  NULL,
    [Location]             VARCHAR (150)  NULL,
    [Affiliation]          VARCHAR (150)  NULL,
    [Category]             VARCHAR (150)  NULL,
    [Primary_Usage]        VARCHAR (300)  NULL,
    [Address]              VARCHAR (150)  NULL,
    [City]                 VARCHAR (150)  NULL,
    [County]               VARCHAR (150)  NULL,
    [State]                VARCHAR (150)  NULL,
    [ZIP]                  VARCHAR (150)  NULL,
    [Country_Code]         VARCHAR (150)  NULL,
    [Address_Code]         VARCHAR (150)  NULL,
    [Occupied]             VARCHAR (150)  NULL,
    [Thumb]                VARCHAR (150)  NULL,
    [Cover]                VARCHAR (MAX)  NULL,
    [CIFS_Thumb]           VARCHAR (MAX)  NULL,
    [CIFS_Cover]           VARCHAR (MAX)  NULL,
    [CEFA_Name]            VARCHAR (150)  NULL,
    [Floors]               INT            NULL,
    [Space_Count]          INT            NULL,
    [Constructed]          VARCHAR (150)  NULL,
    [Renovated]            VARCHAR (150)  NULL,
    [Vacated]              VARCHAR (150)  NULL,
    [Demolished]           VARCHAR (150)  NULL,
    [Last_Reviewed]        VARCHAR (150)  NULL,
    [Latitude]             REAL           NULL,
    [Longitude]            REAL           NULL,
    [Google_Maps_URL]      VARCHAR (MAX)  NULL,
    [CIFS_kml_lonlat]      VARCHAR (1024) NULL
);


GO

CREATE TABLE [dbo].[BldgName] (
    [Bldg_Key]          VARCHAR (150) NULL,
    [Display_Name_Type] VARCHAR (150) NULL,
    [Display_Name]      VARCHAR (150) NULL
);


GO

CREATE TABLE [dbo].[Dept] (
    [Space_Acctng_Dept_Key]  VARCHAR (150) NULL,
    [dept_name]              VARCHAR (150) NULL,
    [dept_program]           VARCHAR (150) NULL,
    [program_type]           VARCHAR (150) NULL,
    [program_standard_code]  VARCHAR (150) NULL,
    [fis_chart_num]          VARCHAR (150) NULL,
    [fis_org_id]             VARCHAR (150) NULL,
    [fis_chart_num_level_1]  VARCHAR (150) NULL,
    [fis_org_id_level_1]     VARCHAR (150) NULL,
    [fis_org_name_level_1]   VARCHAR (255) NULL,
    [fis_chart_num_level_2]  VARCHAR (150) NULL,
    [fis_org_id_level_2]     VARCHAR (150) NULL,
    [fis_org_name_level_2]   VARCHAR (255) NULL,
    [fis_chart_num_level_3]  VARCHAR (150) NULL,
    [fis_org_id_level_3]     VARCHAR (150) NULL,
    [fis_org_name_level_3]   VARCHAR (255) NULL,
    [fis_chart_num_level_4]  VARCHAR (150) NULL,
    [fis_org_id_level_4]     VARCHAR (150) NULL,
    [fis_org_name_level_4]   VARCHAR (255) NULL,
    [fis_chart_num_level_5]  VARCHAR (150) NULL,
    [fis_org_id_level_5]     VARCHAR (150) NULL,
    [fis_org_name_level_5]   VARCHAR (255) NULL,
    [fis_chart_num_level_6]  VARCHAR (150) NULL,
    [fis_org_id_level_6]     VARCHAR (150) NULL,
    [fis_org_name_level_6]   VARCHAR (255) NULL,
    [fis_chart_num_level_7]  VARCHAR (150) NULL,
    [fis_org_id_level_7]     VARCHAR (150) NULL,
    [fis_org_name_level_7]   VARCHAR (255) NULL,
    [fis_chart_num_level_8]  VARCHAR (150) NULL,
    [fis_org_id_level_8]     VARCHAR (150) NULL,
    [fis_org_name_level_8]   VARCHAR (255) NULL,
    [fis_chart_num_level_9]  VARCHAR (150) NULL,
    [fis_org_id_level_9]     VARCHAR (150) NULL,
    [fis_org_name_level_9]   VARCHAR (255) NULL,
    [fis_chart_num_level_10] VARCHAR (150) NULL,
    [fis_org_id_level_10]    VARCHAR (150) NULL,
    [fis_org_name_level_10]  VARCHAR (255) NULL,
    [fis_chart_num_level_11] VARCHAR (150) NULL,
    [fis_org_id_level_11]    VARCHAR (150) NULL,
    [fis_org_name_level_11]  VARCHAR (255) NULL,
    [fis_chart_num_level_12] VARCHAR (150) NULL,
    [fis_org_id_level_12]    VARCHAR (150) NULL,
    [fis_org_name_level_12]  VARCHAR (255) NULL,
    [fis_chart_num_level_13] VARCHAR (150) NULL,
    [fis_org_id_level_13]    VARCHAR (150) NULL,
    [fis_org_name_level_13]  VARCHAR (255) NULL,
    [fis_chart_num_level_14] VARCHAR (150) NULL,
    [fis_org_id_level_14]    VARCHAR (150) NULL,
    [fis_org_name_level_14]  VARCHAR (255) NULL,
    [fis_chart_num_level_15] VARCHAR (150) NULL,
    [fis_org_id_level_15]    VARCHAR (150) NULL,
    [fis_org_name_level_15]  VARCHAR (255) NULL,
    [fis_chart_num_level_16] VARCHAR (150) NULL,
    [fis_org_id_level_16]    VARCHAR (150) NULL,
    [fis_org_name_level_16]  VARCHAR (255) NULL,
    [fis_chart_num_level_17] VARCHAR (150) NULL,
    [fis_org_id_level_17]    VARCHAR (150) NULL,
    [fis_org_name_level_17]  VARCHAR (255) NULL,
    [fis_chart_num_level_18] VARCHAR (150) NULL,
    [fis_org_id_level_18]    VARCHAR (150) NULL,
    [fis_org_name_level_18]  VARCHAR (255) NULL,
    [fis_chart_num_level_19] VARCHAR (150) NULL,
    [fis_org_id_level_19]    VARCHAR (150) NULL,
    [fis_org_name_level_19]  VARCHAR (255) NULL,
    [fis_chart_num_level_20] VARCHAR (150) NULL,
    [fis_org_id_level_20]    VARCHAR (150) NULL,
    [fis_org_name_level_20]  VARCHAR (255) NULL,
    [cost_center]            VARCHAR (150) NULL,
    [bldg_count]             INT           NULL,
    [room_count]             INT           NULL,
    [space_count]            INT           NULL,
    [square_feet]            INT           NULL,
    [custodial_code]         VARCHAR (150) NULL,
    [dept_fis_org]           VARCHAR (150) NULL,
    [dvsn_code]              VARCHAR (150) NULL,
    [dvsn_name]              VARCHAR (150) NULL
);


GO

CREATE TABLE [dbo].[DeptBldg] (
    [Space_Acctng_Dept_Key] VARCHAR (150) NULL,
    [Bldg_Key]              VARCHAR (150) NULL,
    [Square_Feet]           INT           NULL
);


GO

CREATE TABLE [dbo].[DeptName] (
    [Space_Acctng_Dept_Key] VARCHAR (150) NULL,
    [Display_Name_Type]     VARCHAR (150) NULL,
    [Display_Name]          VARCHAR (150) NULL
);


GO

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


GO

CREATE TABLE [dbo].[Documents] (
    [Id]          INT            IDENTITY (1, 1) NOT NULL,
    [Active]      BIT            NOT NULL,
    [Name]        NVARCHAR (64)  NOT NULL,
    [EnvelopeId]  NVARCHAR (64)  NOT NULL,
    [TemplateId]  NVARCHAR (64)  NOT NULL,
    [Status]      NVARCHAR (64)  NOT NULL,
    [PersonId]    INT            NULL,
    [Notes]       NVARCHAR (MAX) NULL,
    [Tags]        NVARCHAR (MAX) NULL,
    [TeamId]      INT            NOT NULL,
    [CreatedAt]   DATETIME2 (7)  NOT NULL,
    [CompletedAt] DATETIME2 (7)  NULL,
    [AccountId]   NVARCHAR (64)  NULL,
    [ApiBasePath] NVARCHAR (64)  NULL,
    CONSTRAINT [PK_Documents] PRIMARY KEY CLUSTERED ([Id] ASC)
);


GO

CREATE NONCLUSTERED INDEX [IX_Documents_PersonId]
    ON [dbo].[Documents]([PersonId] ASC);


GO

CREATE NONCLUSTERED INDEX [IX_Documents_Active]
    ON [dbo].[Documents]([Active] DESC);


GO

CREATE NONCLUSTERED INDEX [IX_Documents_TeamId]
    ON [dbo].[Documents]([TeamId] ASC);


GO

CREATE TABLE [dbo].[Equipment] (
    [Id]                    INT            IDENTITY (1, 1) NOT NULL,
    [Active]                BIT            NOT NULL,
    [EquipmentAssignmentId] INT            NULL,
    [Make]                  NVARCHAR (MAX) NULL,
    [Model]                 NVARCHAR (MAX) NULL,
    [Name]                  NVARCHAR (64)  NOT NULL,
    [SerialNumber]          NVARCHAR (MAX) NULL,
    [SpaceId]               INT            NULL,
    [Tags]                  NVARCHAR (MAX) NULL,
    [TeamId]                INT            NOT NULL,
    [Type]                  NVARCHAR (MAX) NULL,
    [Notes]                 NVARCHAR (MAX) NULL,
    [ProtectionLevel]       NVARCHAR (2)   NULL,
    [AvailabilityLevel]     NVARCHAR (2)   NULL,
    [SystemManagementId ]   NVARCHAR (16)  NULL,
    CONSTRAINT [PK_Equipment] PRIMARY KEY CLUSTERED ([Id] ASC)
);


GO

CREATE NONCLUSTERED INDEX [IX_Equipment_SpaceId]
    ON [dbo].[Equipment]([SpaceId] ASC);


GO

CREATE NONCLUSTERED INDEX [IX_Equipment_TeamId]
    ON [dbo].[Equipment]([TeamId] ASC);


GO

CREATE NONCLUSTERED INDEX [IX_Equipment_EquipmentAssignmentId]
    ON [dbo].[Equipment]([EquipmentAssignmentId] ASC);


GO

CREATE NONCLUSTERED INDEX [IX_Equipment_Active]
    ON [dbo].[Equipment]([Active] DESC);


GO

CREATE TABLE [dbo].[EquipmentAssignments] (
    [Id]                   INT            IDENTITY (1, 1) NOT NULL,
    [ApprovedAt]           DATETIME2 (7)  NULL,
    [ConfirmedAt]          DATETIME2 (7)  NULL,
    [ExpiresAt]            DATETIME2 (7)  NOT NULL,
    [IsConfirmed]          BIT            NOT NULL,
    [PersonId]             INT            NOT NULL,
    [RequestedAt]          DATETIME2 (7)  NOT NULL,
    [RequestedById]        NVARCHAR (450) NULL,
    [RequestedByName]      NVARCHAR (MAX) NULL,
    [NextNotificationDate] DATETIME2 (7)  NULL,
    CONSTRAINT [PK_EquipmentAssignments] PRIMARY KEY CLUSTERED ([Id] ASC)
);


GO

CREATE NONCLUSTERED INDEX [IX_EquipmentAssignments_RequestedById]
    ON [dbo].[EquipmentAssignments]([RequestedById] ASC);


GO

CREATE NONCLUSTERED INDEX [IX_EquipmentAssignments_PersonId]
    ON [dbo].[EquipmentAssignments]([PersonId] ASC);


GO

CREATE TABLE [dbo].[EquipmentAttributeKeys] (
    [Id]          INT            IDENTITY (1, 1) NOT NULL,
    [TeamId]      INT            NULL,
    [Key]         NVARCHAR (MAX) NOT NULL,
    [Description] NVARCHAR (50)  NOT NULL,
    PRIMARY KEY CLUSTERED ([Id] ASC)
);


GO

CREATE TABLE [dbo].[EquipmentAttributes] (
    [Id]          INT            IDENTITY (1, 1) NOT NULL,
    [EquipmentId] INT            NOT NULL,
    [Key]         NVARCHAR (MAX) NULL,
    [Value]       NVARCHAR (MAX) NULL,
    CONSTRAINT [PK_EquipmentAttributes] PRIMARY KEY CLUSTERED ([Id] ASC)
);


GO

CREATE NONCLUSTERED INDEX [IX_EquipmentAttributes_EquipmentId]
    ON [dbo].[EquipmentAttributes]([EquipmentId] ASC);


GO

CREATE TABLE [dbo].[FISOrgs] (
    [Id]      INT          IDENTITY (1, 1) NOT NULL,
    [Chart]   NVARCHAR (1) NOT NULL,
    [OrgCode] NVARCHAR (6) NOT NULL,
    [TeamId]  INT          NOT NULL,
    CONSTRAINT [PK_FISOrgs] PRIMARY KEY CLUSTERED ([Id] ASC)
);


GO

CREATE NONCLUSTERED INDEX [IX_FISOrgs_TeamId]
    ON [dbo].[FISOrgs]([TeamId] ASC);


GO

CREATE TABLE [dbo].[Floor] (
    [Bldg_Key]            VARCHAR (150) NULL,
    [Floor_Key]           VARCHAR (150) NULL,
    [Floor_Code]          VARCHAR (150) NULL,
    [Floor_Name]          VARCHAR (150) NULL,
    [Floor_Order]         VARCHAR (150) NULL,
    [Basic_Gross]         VARCHAR (150) NULL,
    [CU_Gross]            VARCHAR (150) NULL,
    [Circulation]         VARCHAR (150) NULL,
    [Custodial]           VARCHAR (150) NULL,
    [Mechanical]          VARCHAR (150) NULL,
    [Parking]             VARCHAR (150) NULL,
    [Toilet]              VARCHAR (150) NULL,
    [NASF]                VARCHAR (150) NULL,
    [ASF]                 VARCHAR (150) NULL,
    [Space_Count]         VARCHAR (150) NULL,
    [Net_Usable]          VARCHAR (150) NULL,
    [Structural]          VARCHAR (150) NULL,
    [Outside_Gross]       VARCHAR (150) NULL,
    [Related_Gross]       VARCHAR (150) NULL,
    [Maintained_Gross]    VARCHAR (150) NULL,
    [Janitorized]         VARCHAR (150) NULL,
    [Above_Ground_Inches] VARCHAR (150) NULL
);


GO

CREATE TABLE [dbo].[GroupPermissions] (
    [Id]      INT            IDENTITY (1, 1) NOT NULL,
    [GroupId] INT            NOT NULL,
    [UserId]  NVARCHAR (450) NOT NULL,
    CONSTRAINT [PK_GroupPermissions] PRIMARY KEY CLUSTERED ([Id] ASC)
);


GO

CREATE TABLE [dbo].[GroupXTeams] (
    [Id]      INT IDENTITY (1, 1) NOT NULL,
    [GroupId] INT NOT NULL,
    [TeamId]  INT NOT NULL,
    CONSTRAINT [PK_GroupXTeams] PRIMARY KEY CLUSTERED ([Id] ASC)
);


GO

CREATE TABLE [dbo].[Groups] (
    [Id]   INT            IDENTITY (1, 1) NOT NULL,
    [Name] NVARCHAR (128) NOT NULL,
    CONSTRAINT [PK_Groups] PRIMARY KEY CLUSTERED ([Id] ASC)
);


GO

CREATE TABLE [dbo].[Histories] (
    [Id]            INT            IDENTITY (1, 1) NOT NULL,
    [AccessId]      INT            NULL,
    [ActedDate]     DATETIME2 (7)  NOT NULL,
    [ActionType]    NVARCHAR (MAX) NULL,
    [ActorId]       NVARCHAR (450) NULL,
    [AssetType]     NVARCHAR (MAX) NULL,
    [Description]   NVARCHAR (MAX) NOT NULL,
    [EquipmentId]   INT            NULL,
    [KeyId]         INT            NULL,
    [KeySerialId]   INT            NULL,
    [TargetId]      INT            NULL,
    [WorkstationId] INT            NULL,
    [DocumentId]    INT            NULL,
    CONSTRAINT [PK_Histories] PRIMARY KEY CLUSTERED ([Id] ASC)
);


GO

CREATE NONCLUSTERED INDEX [IX_Histories_TargetId]
    ON [dbo].[Histories]([TargetId] ASC);


GO

CREATE NONCLUSTERED INDEX [IX_Histories_WorkstationId]
    ON [dbo].[Histories]([WorkstationId] ASC);


GO

CREATE NONCLUSTERED INDEX [IX_Histories_AccessId]
    ON [dbo].[Histories]([AccessId] ASC);


GO

CREATE NONCLUSTERED INDEX [IX_Histories_KeySerialId]
    ON [dbo].[Histories]([KeySerialId] ASC);


GO

CREATE NONCLUSTERED INDEX [IX_Histories_EquipmentId]
    ON [dbo].[Histories]([EquipmentId] ASC);


GO

CREATE NONCLUSTERED INDEX [IX_Histories_KeyId]
    ON [dbo].[Histories]([KeyId] ASC);


GO

CREATE NONCLUSTERED INDEX [IX_Histories_ActorId]
    ON [dbo].[Histories]([ActorId] ASC);


GO

CREATE TABLE [dbo].[KeySerialAssignments] (
    [Id]                   INT            IDENTITY (1, 1) NOT NULL,
    [ApprovedAt]           DATETIME2 (7)  NULL,
    [ConfirmedAt]          DATETIME2 (7)  NULL,
    [ExpiresAt]            DATETIME2 (7)  NOT NULL,
    [IsConfirmed]          BIT            NOT NULL,
    [KeySerialId]          INT            NOT NULL,
    [PersonId]             INT            NOT NULL,
    [RequestedAt]          DATETIME2 (7)  NOT NULL,
    [RequestedById]        NVARCHAR (450) NULL,
    [RequestedByName]      NVARCHAR (MAX) NULL,
    [NextNotificationDate] DATETIME2 (7)  NULL,
    CONSTRAINT [PK_KeySerialAssignments] PRIMARY KEY CLUSTERED ([Id] ASC)
);


GO

CREATE NONCLUSTERED INDEX [IX_KeySerialAssignments_PersonId]
    ON [dbo].[KeySerialAssignments]([PersonId] ASC);


GO

CREATE NONCLUSTERED INDEX [IX_KeySerialAssignments_RequestedById]
    ON [dbo].[KeySerialAssignments]([RequestedById] ASC);


GO

CREATE TABLE [dbo].[KeySerials] (
    [Id]                    INT            IDENTITY (1, 1) NOT NULL,
    [Active]                BIT            NOT NULL,
    [KeySerialAssignmentId] INT            NULL,
    [KeyId]                 INT            NOT NULL,
    [Number]                NVARCHAR (MAX) NULL,
    [Status]                NVARCHAR (50)  DEFAULT ('Active') NOT NULL,
    [Name]                  NVARCHAR (64)  NOT NULL,
    [Tags]                  NVARCHAR (MAX) NULL,
    [TeamId]                INT            NOT NULL,
    [Notes]                 NVARCHAR (MAX) NULL,
    CONSTRAINT [PK_KeySerials] PRIMARY KEY CLUSTERED ([Id] ASC)
);


GO

CREATE NONCLUSTERED INDEX [IX_KeySerials_KeyAssignmentId]
    ON [dbo].[KeySerials]([KeySerialAssignmentId] ASC);


GO

CREATE NONCLUSTERED INDEX [IX_KeySerials_KeyId]
    ON [dbo].[KeySerials]([KeyId] ASC);


GO

CREATE UNIQUE NONCLUSTERED INDEX [UX_KeySerials_KeySerialAssignmentId]
    ON [dbo].[KeySerials]([KeySerialAssignmentId] ASC) WHERE ([KeySerialAssignmentId] IS NOT NULL);


GO

CREATE TABLE [dbo].[KeyXSpaces] (
    [Id]      INT IDENTITY (1, 1) NOT NULL,
    [KeyId]   INT NOT NULL,
    [SpaceId] INT NOT NULL,
    CONSTRAINT [PK_KeyXSpaces] PRIMARY KEY CLUSTERED ([Id] ASC)
);


GO

CREATE NONCLUSTERED INDEX [IX_KeyXSpaces_SpaceId]
    ON [dbo].[KeyXSpaces]([SpaceId] ASC);


GO

CREATE NONCLUSTERED INDEX [IX_KeyXSpaces_KeyId]
    ON [dbo].[KeyXSpaces]([KeyId] ASC);


GO

CREATE TABLE [dbo].[Keys] (
    [Id]     INT            IDENTITY (1, 1) NOT NULL,
    [Active] BIT            NOT NULL,
    [Code]   NVARCHAR (64)  NOT NULL,
    [Name]   NVARCHAR (64)  NOT NULL,
    [Tags]   NVARCHAR (MAX) NULL,
    [TeamId] INT            NOT NULL,
    [Notes]  NVARCHAR (MAX) NULL,
    CONSTRAINT [PK_Keys] PRIMARY KEY CLUSTERED ([Id] ASC)
);


GO

CREATE NONCLUSTERED INDEX [IX_Keys_Active]
    ON [dbo].[Keys]([Active] DESC);


GO

CREATE NONCLUSTERED INDEX [IX_Keys_TeamId]
    ON [dbo].[Keys]([TeamId] ASC);


GO

CREATE TABLE [dbo].[LoadingSpaces] (
    [DeptKey]          VARCHAR (20)  NOT NULL,
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
    [SqFt]             INT           NULL,
    [Source]           VARCHAR (100) NULL,
    [Active]           BIT           NULL,
    CONSTRAINT [PK_LoadingSpace] PRIMARY KEY CLUSTERED ([DeptKey] ASC, [RoomKey] ASC)
);


GO

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
    CONSTRAINT [PK_Notifications] PRIMARY KEY CLUSTERED ([Id] ASC)
);


GO

CREATE NONCLUSTERED INDEX [IX_Notifications_Pending_UserId]
    ON [dbo].[Notifications]([Pending] DESC, [UserId] ASC)
    INCLUDE([DateTimeCreated], [DateTimeSent], [Details], [HistoryId], [NeedsAccept], [TeamId]);


GO

CREATE NONCLUSTERED INDEX [IX_Notifications_Team_DateCreated]
    ON [dbo].[Notifications]([TeamId] ASC, [DateTimeCreated] DESC)
    INCLUDE([DateTimeSent], [Details], [HistoryId], [NeedsAccept]);


GO

CREATE NONCLUSTERED INDEX [IX_Notifications_UserId]
    ON [dbo].[Notifications]([UserId] ASC);


GO

CREATE NONCLUSTERED INDEX [IX_Notifications_HistoryId]
    ON [dbo].[Notifications]([HistoryId] ASC);


GO

CREATE TABLE [dbo].[People] (
    [Id]           INT            IDENTITY (1, 1) NOT NULL,
    [Active]       BIT            NOT NULL,
    [Category]     NVARCHAR (MAX) NULL,
    [Email]        NVARCHAR (256) NOT NULL,
    [EndDate]      DATETIME2 (7)  NULL,
    [FirstName]    NVARCHAR (50)  NOT NULL,
    [HomePhone]    NVARCHAR (MAX) NULL,
    [LastName]     NVARCHAR (50)  NOT NULL,
    [Notes]        NVARCHAR (MAX) NULL,
    [StartDate]    DATETIME2 (7)  NULL,
    [SupervisorId] INT            NULL,
    [Tags]         NVARCHAR (MAX) NULL,
    [TeamId]       INT            NOT NULL,
    [TeamPhone]    NVARCHAR (MAX) NULL,
    [Title]        NVARCHAR (MAX) NULL,
    [UserId]       NVARCHAR (450) NULL,
    CONSTRAINT [PK_People] PRIMARY KEY CLUSTERED ([Id] ASC)
);


GO

CREATE NONCLUSTERED INDEX [IX_People_SupervisorId]
    ON [dbo].[People]([SupervisorId] ASC);


GO

CREATE NONCLUSTERED INDEX [IX_People_UserId]
    ON [dbo].[People]([UserId] ASC);


GO

CREATE NONCLUSTERED INDEX [IX_People_TeamId]
    ON [dbo].[People]([TeamId] ASC);


GO

CREATE TABLE [dbo].[PersonNotifications] (
    [Id]                INT            IDENTITY (1, 1) NOT NULL,
    [Pending]           BIT            NOT NULL,
    [NotificationEmail] NVARCHAR (256) NULL,
    [PersonEmail]       NVARCHAR (256) NOT NULL,
    [PersonName]        NVARCHAR (256) NOT NULL,
    [PersonId]          INT            NULL,
    [ActionDate]        DATETIME2 (7)  NOT NULL,
    [ActorName]         NVARCHAR (256) NOT NULL,
    [Action]            NVARCHAR (50)  NOT NULL,
    [TeamId]            INT            NULL,
    [NotificationDate]  DATETIME2 (7)  NULL,
    [ActorId]           NVARCHAR (50)  NOT NULL,
    [Notes]             NVARCHAR (256) NULL,
    CONSTRAINT [PK_PersonNotifications] PRIMARY KEY CLUSTERED ([Id] ASC)
);


GO

CREATE TABLE [dbo].[Roles] (
    [Id]      INT           IDENTITY (1, 1) NOT NULL,
    [IsAdmin] BIT           NOT NULL,
    [Name]    NVARCHAR (50) NOT NULL,
    CONSTRAINT [PK_Roles] PRIMARY KEY CLUSTERED ([Id] ASC)
);


GO

CREATE TABLE [dbo].[Room] (
    [Bldg_Key]              VARCHAR (150) NULL,
    [Floor_Key]             VARCHAR (150) NULL,
    [Room_Key]              VARCHAR (150) NULL,
    [Room]                  VARCHAR (150) NULL,
    [Square_Feet]           VARCHAR (150) NULL,
    [Room_Category_Code]    VARCHAR (150) NULL,
    [Room_Category_Name]    VARCHAR (150) NULL,
    [Floor_Order]           VARCHAR (150) NULL,
    [Floor_Code]            VARCHAR (150) NULL,
    [Floor_Name]            VARCHAR (150) NULL,
    [Latitude]              VARCHAR (150) NULL,
    [Longitude]             VARCHAR (150) NULL,
    [Room_Name]             VARCHAR (150) NULL,
    [Ceiling_Height_Inches] VARCHAR (150) NULL,
    [Perimeter_Inches]      VARCHAR (150) NULL
);


GO

CREATE UNIQUE NONCLUSTERED INDEX [NonClusteredIndex-20180822-081109]
    ON [dbo].[Room]([Room_Key] ASC);


GO

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

CREATE NONCLUSTERED INDEX [IX_Spaces_OrgId]
    ON [dbo].[Spaces]([OrgId] ASC);


GO

CREATE NONCLUSTERED INDEX [IX_Spaces_Active]
    ON [dbo].[Spaces]([Active] DESC);


GO

CREATE NONCLUSTERED INDEX [IX_Spaces_OrgId_ActiveBldgKeyBldgNmChartNumDeptKeyDeptNmFloorKeyFloorNmRmCatCdRmCatNmRmKeyRmNumSrc]
    ON [dbo].[Spaces]([OrgId] ASC)
    INCLUDE([Active], [BldgKey], [BldgName], [ChartNum], [DeptKey], [RoomName], [RoomNumber], [Source], [DeptName], [FloorKey], [FloorName], [RoomCategoryCode], [RoomCategoryName], [RoomKey]);


GO

CREATE TABLE [dbo].[SystemPermissions] (
    [Id]     INT            IDENTITY (1, 1) NOT NULL,
    [RoleId] INT            NOT NULL,
    [UserId] NVARCHAR (450) NOT NULL,
    CONSTRAINT [PK_SystemPermissions] PRIMARY KEY CLUSTERED ([Id] ASC)
);


GO

CREATE NONCLUSTERED INDEX [IX_SystemPermissions_RoleId]
    ON [dbo].[SystemPermissions]([RoleId] ASC);


GO

CREATE NONCLUSTERED INDEX [IX_SystemPermissions_UserId]
    ON [dbo].[SystemPermissions]([UserId] ASC);


GO

CREATE TABLE [dbo].[Tags] (
    [Id]     INT            IDENTITY (1, 1) NOT NULL,
    [Name]   NVARCHAR (128) NOT NULL,
    [TeamId] INT            NOT NULL,
    CONSTRAINT [PK_Tags] PRIMARY KEY CLUSTERED ([Id] ASC)
);


GO

CREATE NONCLUSTERED INDEX [IX_Tags_TeamId]
    ON [dbo].[Tags]([TeamId] ASC);


GO

CREATE TABLE [dbo].[TeamApiCodes] (
    [Id]      INT              IDENTITY (1, 1) NOT NULL,
    [TeamId]  INT              NOT NULL,
    [ApiCode] UNIQUEIDENTIFIER NOT NULL
);


GO

CREATE NONCLUSTERED INDEX [IX_TeamApiCodes_Column]
    ON [dbo].[TeamApiCodes]([ApiCode] ASC);


GO

CREATE TABLE [dbo].[TeamDocumentSettings] (
    [Id]         INT           IDENTITY (1, 1) NOT NULL,
    [Name]       NVARCHAR (64) NOT NULL,
    [TemplateId] NVARCHAR (64) NOT NULL,
    [TeamId]     INT           NOT NULL,
    CONSTRAINT [PK_TeamDocumentSettings] PRIMARY KEY CLUSTERED ([Id] ASC)
);


GO

CREATE NONCLUSTERED INDEX [IX_TeamDocumentSettings_TeamId]
    ON [dbo].[TeamDocumentSettings]([TeamId] ASC);


GO

CREATE TABLE [dbo].[TeamPermissions] (
    [Id]     INT            IDENTITY (1, 1) NOT NULL,
    [RoleId] INT            NOT NULL,
    [TeamId] INT            NOT NULL,
    [UserId] NVARCHAR (450) NOT NULL,
    CONSTRAINT [PK_TeamPermissions] PRIMARY KEY CLUSTERED ([Id] ASC)
);


GO

CREATE NONCLUSTERED INDEX [IX_TeamPermissions_TeamId]
    ON [dbo].[TeamPermissions]([TeamId] ASC);


GO

CREATE NONCLUSTERED INDEX [IX_TeamPermissions_UserId]
    ON [dbo].[TeamPermissions]([UserId] ASC);


GO

CREATE NONCLUSTERED INDEX [IX_TeamPermissions_RoleId]
    ON [dbo].[TeamPermissions]([RoleId] ASC);


GO

CREATE TABLE [dbo].[TeamPpsDepartments] (
    [Id]                INT            IDENTITY (1, 1) NOT NULL,
    [PpsDepartmentCode] NVARCHAR (6)   NOT NULL,
    [DepartmentName]    NVARCHAR (250) NOT NULL,
    [TeamId]            INT            NOT NULL,
    CONSTRAINT [PK_TeamPpsDepartments] PRIMARY KEY CLUSTERED ([Id] ASC)
);


GO

CREATE TABLE [dbo].[Teams] (
    [Id]                        INT              IDENTITY (1, 1) NOT NULL,
    [Name]                      NVARCHAR (128)   NOT NULL,
    [Slug]                      NVARCHAR (40)    NOT NULL,
    [ApiCode]                   UNIQUEIDENTIFIER NULL,
    [BoardingNotificationEmail] NVARCHAR (256)   NULL,
    [DocumentAccountName]       NVARCHAR (256)   NULL,
    [DocumentAccountId]         NVARCHAR (64)    NULL,
    [DocumentApiBasePath]       NVARCHAR (64)    NULL,
    CONSTRAINT [PK_Teams] PRIMARY KEY CLUSTERED ([Id] ASC)
);


GO

CREATE TABLE [dbo].[Users] (
    [Id]        NVARCHAR (450) NOT NULL,
    [Iam]       NVARCHAR (450) NULL,
    [Email]     NVARCHAR (256) NOT NULL,
    [FirstName] NVARCHAR (50)  NOT NULL,
    [LastName]  NVARCHAR (50)  NOT NULL,
    [Pronouns]  NVARCHAR (50)  NULL,
    CONSTRAINT [PK_Users] PRIMARY KEY CLUSTERED ([Id] ASC)
);


GO

CREATE TABLE [dbo].[WorkstationAssignments] (
    [Id]                   INT            IDENTITY (1, 1) NOT NULL,
    [ApprovedAt]           DATETIME2 (7)  NULL,
    [ConfirmedAt]          DATETIME2 (7)  NULL,
    [ExpiresAt]            DATETIME2 (7)  NOT NULL,
    [IsConfirmed]          BIT            NOT NULL,
    [PersonId]             INT            NOT NULL,
    [RequestedAt]          DATETIME2 (7)  NOT NULL,
    [RequestedById]        NVARCHAR (450) NULL,
    [RequestedByName]      NVARCHAR (MAX) NULL,
    [NextNotificationDate] DATETIME2 (7)  NULL,
    CONSTRAINT [PK_WorkstationAssignments] PRIMARY KEY CLUSTERED ([Id] ASC)
);


GO

CREATE NONCLUSTERED INDEX [IX_WorkstationAssignments_RequestedById]
    ON [dbo].[WorkstationAssignments]([RequestedById] ASC);


GO

CREATE NONCLUSTERED INDEX [IX_WorkstationAssignments_PersonId]
    ON [dbo].[WorkstationAssignments]([PersonId] ASC);


GO

CREATE TABLE [dbo].[WorkstationAttributes] (
    [Id]            INT            IDENTITY (1, 1) NOT NULL,
    [Key]           NVARCHAR (MAX) NULL,
    [Value]         NVARCHAR (MAX) NULL,
    [WorkstationId] INT            NOT NULL,
    CONSTRAINT [PK_WorkstationAttributes] PRIMARY KEY CLUSTERED ([Id] ASC)
);


GO

CREATE NONCLUSTERED INDEX [IX_WorkstationAttributes_WorkstationId]
    ON [dbo].[WorkstationAttributes]([WorkstationId] ASC);


GO

CREATE TABLE [dbo].[Workstations] (
    [Id]                      INT            IDENTITY (1, 1) NOT NULL,
    [Active]                  BIT            NOT NULL,
    [Name]                    NVARCHAR (64)  NOT NULL,
    [SpaceId]                 INT            NOT NULL,
    [Tags]                    NVARCHAR (100) NULL,
    [TeamId]                  INT            NOT NULL,
    [Type]                    NVARCHAR (MAX) NULL,
    [WorkstationAssignmentId] INT            NULL,
    [Notes]                   NVARCHAR (MAX) NULL,
    CONSTRAINT [PK_Workstations] PRIMARY KEY CLUSTERED ([Id] ASC)
);


GO

CREATE NONCLUSTERED INDEX [IX_Workstations_TeamId]
    ON [dbo].[Workstations]([TeamId] ASC);


GO

CREATE NONCLUSTERED INDEX [IX_Workstations_Active]
    ON [dbo].[Workstations]([Active] DESC);


GO

CREATE NONCLUSTERED INDEX [IX_Workstations_WorkstationAssignmentId]
    ON [dbo].[Workstations]([WorkstationAssignmentId] ASC);


GO

CREATE NONCLUSTERED INDEX [IX_Workstations_SpaceId]
    ON [dbo].[Workstations]([SpaceId] ASC);


GO

CREATE NONCLUSTERED INDEX [IX_Workstations_Tags]
    ON [dbo].[Workstations]([Tags] ASC);


GO

ALTER TABLE [dbo].[Access] ADD CONSTRAINT [FK_Access_Teams_TeamId] FOREIGN KEY ([TeamId]) REFERENCES [dbo].[Teams] ([Id]) ON DELETE CASCADE;
GO
ALTER TABLE [dbo].[AccessAssignments] ADD CONSTRAINT [FK_AccessAssignments_Access_AccessId] FOREIGN KEY ([AccessId]) REFERENCES [dbo].[Access] ([Id]);
GO
ALTER TABLE [dbo].[AccessAssignments] ADD CONSTRAINT [FK_AccessAssignments_People_PersonId] FOREIGN KEY ([PersonId]) REFERENCES [dbo].[People] ([Id]) ON DELETE CASCADE;
GO
ALTER TABLE [dbo].[AccessAssignments] ADD CONSTRAINT [FK_AccessAssignments_Users_RequestedById] FOREIGN KEY ([RequestedById]) REFERENCES [dbo].[Users] ([Id]);
GO
ALTER TABLE [dbo].[Documents] ADD CONSTRAINT [FK_Documents_People_PersonId] FOREIGN KEY ([PersonId]) REFERENCES [dbo].[People] ([Id]);
GO
ALTER TABLE [dbo].[Documents] ADD CONSTRAINT [FK_Documents_Teams_TeamId] FOREIGN KEY ([TeamId]) REFERENCES [dbo].[Teams] ([Id]) ON DELETE CASCADE;
GO
ALTER TABLE [dbo].[Equipment] ADD CONSTRAINT [FK_Equipment_EquipmentAssignments_EquipmentAssignmentId] FOREIGN KEY ([EquipmentAssignmentId]) REFERENCES [dbo].[EquipmentAssignments] ([Id]);
GO
ALTER TABLE [dbo].[Equipment] ADD CONSTRAINT [FK_Equipment_Spaces_SpaceId] FOREIGN KEY ([SpaceId]) REFERENCES [dbo].[Spaces] ([Id]);
GO
ALTER TABLE [dbo].[Equipment] ADD CONSTRAINT [FK_Equipment_Teams_TeamId] FOREIGN KEY ([TeamId]) REFERENCES [dbo].[Teams] ([Id]) ON DELETE CASCADE;
GO
ALTER TABLE [dbo].[EquipmentAssignments] ADD CONSTRAINT [FK_EquipmentAssignments_People_PersonId] FOREIGN KEY ([PersonId]) REFERENCES [dbo].[People] ([Id]) ON DELETE CASCADE;
GO
ALTER TABLE [dbo].[EquipmentAssignments] ADD CONSTRAINT [FK_EquipmentAssignments_Users_RequestedById] FOREIGN KEY ([RequestedById]) REFERENCES [dbo].[Users] ([Id]);
GO
ALTER TABLE [dbo].[EquipmentAttributeKeys] ADD CONSTRAINT [FK_EquipmentAttributeKeys_Teams_TeamId] FOREIGN KEY ([TeamId]) REFERENCES [dbo].[Teams] ([Id]) ON DELETE CASCADE;
GO
ALTER TABLE [dbo].[EquipmentAttributes] ADD CONSTRAINT [FK_EquipmentAttributes_Equipment_EquipmentId] FOREIGN KEY ([EquipmentId]) REFERENCES [dbo].[Equipment] ([Id]) ON DELETE CASCADE;
GO
ALTER TABLE [dbo].[FISOrgs] ADD CONSTRAINT [FK_FISOrgs_Teams_TeamId] FOREIGN KEY ([TeamId]) REFERENCES [dbo].[Teams] ([Id]) ON DELETE CASCADE;
GO
ALTER TABLE [dbo].[GroupPermissions] ADD CONSTRAINT [FK_GroupPermissions_Groups_GroupId] FOREIGN KEY ([GroupId]) REFERENCES [dbo].[Groups] ([Id]) ON DELETE CASCADE;
GO
ALTER TABLE [dbo].[GroupPermissions] ADD CONSTRAINT [FK_GroupPermissions_Users_UserId] FOREIGN KEY ([UserId]) REFERENCES [dbo].[Users] ([Id]) ON DELETE CASCADE;
GO
ALTER TABLE [dbo].[GroupXTeams] ADD CONSTRAINT [FK_GroupXTeams_Groups_GroupId] FOREIGN KEY ([GroupId]) REFERENCES [dbo].[Groups] ([Id]) ON DELETE CASCADE;
GO
ALTER TABLE [dbo].[GroupXTeams] ADD CONSTRAINT [FK_GroupXTeams_Teams_TeamId] FOREIGN KEY ([TeamId]) REFERENCES [dbo].[Teams] ([Id]) ON DELETE CASCADE;
GO
ALTER TABLE [dbo].[Histories] ADD CONSTRAINT [FK_Histories_Access_AccessId] FOREIGN KEY ([AccessId]) REFERENCES [dbo].[Access] ([Id]);
GO
ALTER TABLE [dbo].[Histories] ADD CONSTRAINT [FK_Histories_Documents_DocumentId] FOREIGN KEY ([DocumentId]) REFERENCES [dbo].[Documents] ([Id]);
GO
ALTER TABLE [dbo].[Histories] ADD CONSTRAINT [FK_Histories_Equipment_EquipmentId] FOREIGN KEY ([EquipmentId]) REFERENCES [dbo].[Equipment] ([Id]);
GO
ALTER TABLE [dbo].[Histories] ADD CONSTRAINT [FK_Histories_Keys_KeyId] FOREIGN KEY ([KeyId]) REFERENCES [dbo].[Keys] ([Id]);
GO
ALTER TABLE [dbo].[Histories] ADD CONSTRAINT [FK_Histories_KeySerials_KeySerialId] FOREIGN KEY ([KeySerialId]) REFERENCES [dbo].[KeySerials] ([Id]);
GO
ALTER TABLE [dbo].[Histories] ADD CONSTRAINT [FK_Histories_People_TargetId] FOREIGN KEY ([TargetId]) REFERENCES [dbo].[People] ([Id]);
GO
ALTER TABLE [dbo].[Histories] ADD CONSTRAINT [FK_Histories_Users_ActorId] FOREIGN KEY ([ActorId]) REFERENCES [dbo].[Users] ([Id]);
GO
ALTER TABLE [dbo].[Histories] ADD CONSTRAINT [FK_Histories_Workstations_WorkstationId] FOREIGN KEY ([WorkstationId]) REFERENCES [dbo].[Workstations] ([Id]);
GO
ALTER TABLE [dbo].[KeySerialAssignments] ADD CONSTRAINT [FK_KeySerialAssignments_KeySerial_KeySerialId] FOREIGN KEY ([KeySerialId]) REFERENCES [dbo].[KeySerials] ([Id]);
GO
ALTER TABLE [dbo].[KeySerialAssignments] ADD CONSTRAINT [FK_KeySerialAssignments_People_PersonId] FOREIGN KEY ([PersonId]) REFERENCES [dbo].[People] ([Id]) ON DELETE CASCADE;
GO
ALTER TABLE [dbo].[KeySerialAssignments] ADD CONSTRAINT [FK_KeySerialAssignments_Users_RequestedById] FOREIGN KEY ([RequestedById]) REFERENCES [dbo].[Users] ([Id]);
GO
ALTER TABLE [dbo].[KeySerials] ADD CONSTRAINT [FK_KeySerials_Keys_KeyId] FOREIGN KEY ([KeyId]) REFERENCES [dbo].[Keys] ([Id]) ON DELETE CASCADE;
GO
ALTER TABLE [dbo].[KeySerials] ADD CONSTRAINT [FK_KeySerials_Teams_TeamId] FOREIGN KEY ([TeamId]) REFERENCES [dbo].[Teams] ([Id]);
GO
ALTER TABLE [dbo].[KeyXSpaces] ADD CONSTRAINT [FK_KeyXSpaces_Keys_KeyId] FOREIGN KEY ([KeyId]) REFERENCES [dbo].[Keys] ([Id]) ON DELETE CASCADE;
GO
ALTER TABLE [dbo].[KeyXSpaces] ADD CONSTRAINT [FK_KeyXSpaces_Spaces_SpaceId] FOREIGN KEY ([SpaceId]) REFERENCES [dbo].[Spaces] ([Id]) ON DELETE CASCADE;
GO
ALTER TABLE [dbo].[Keys] ADD CONSTRAINT [FK_Keys_Teams_TeamId] FOREIGN KEY ([TeamId]) REFERENCES [dbo].[Teams] ([Id]) ON DELETE CASCADE;
GO
ALTER TABLE [dbo].[Notifications] ADD CONSTRAINT [FK_Notifications_Histories_HistoryId] FOREIGN KEY ([HistoryId]) REFERENCES [dbo].[Histories] ([Id]) ON DELETE CASCADE;
GO
ALTER TABLE [dbo].[Notifications] ADD CONSTRAINT [FK_Notifications_Users_UserId] FOREIGN KEY ([UserId]) REFERENCES [dbo].[Users] ([Id]);
GO
ALTER TABLE [dbo].[People] ADD CONSTRAINT [FK_People_People_SupervisorId] FOREIGN KEY ([SupervisorId]) REFERENCES [dbo].[People] ([Id]);
GO
ALTER TABLE [dbo].[People] ADD CONSTRAINT [FK_People_Teams_TeamId] FOREIGN KEY ([TeamId]) REFERENCES [dbo].[Teams] ([Id]) ON DELETE CASCADE;
GO
ALTER TABLE [dbo].[People] ADD CONSTRAINT [FK_People_Users_UserId] FOREIGN KEY ([UserId]) REFERENCES [dbo].[Users] ([Id]);
GO
ALTER TABLE [dbo].[SystemPermissions] ADD CONSTRAINT [FK_SystemPermissions_Roles_RoleId] FOREIGN KEY ([RoleId]) REFERENCES [dbo].[Roles] ([Id]) ON DELETE CASCADE;
GO
ALTER TABLE [dbo].[SystemPermissions] ADD CONSTRAINT [FK_SystemPermissions_Users_UserId] FOREIGN KEY ([UserId]) REFERENCES [dbo].[Users] ([Id]) ON DELETE CASCADE;
GO
ALTER TABLE [dbo].[Tags] ADD CONSTRAINT [FK_Tags_Teams_TeamId] FOREIGN KEY ([TeamId]) REFERENCES [dbo].[Teams] ([Id]) ON DELETE CASCADE;
GO
ALTER TABLE [dbo].[TeamApiCodes] ADD CONSTRAINT [FK_TeamApiCode_Teams_TeamId] FOREIGN KEY ([TeamId]) REFERENCES [dbo].[Teams] ([Id]) ON DELETE CASCADE;
GO
ALTER TABLE [dbo].[TeamDocumentSettings] ADD CONSTRAINT [FK_TeamDocumentSettings_Teams_TeamId] FOREIGN KEY ([TeamId]) REFERENCES [dbo].[Teams] ([Id]) ON DELETE CASCADE;
GO
ALTER TABLE [dbo].[TeamPermissions] ADD CONSTRAINT [FK_TeamPermissions_Roles_RoleId] FOREIGN KEY ([RoleId]) REFERENCES [dbo].[Roles] ([Id]) ON DELETE CASCADE;
GO
ALTER TABLE [dbo].[TeamPermissions] ADD CONSTRAINT [FK_TeamPermissions_Teams_TeamId] FOREIGN KEY ([TeamId]) REFERENCES [dbo].[Teams] ([Id]) ON DELETE CASCADE;
GO
ALTER TABLE [dbo].[TeamPermissions] ADD CONSTRAINT [FK_TeamPermissions_Users_UserId] FOREIGN KEY ([UserId]) REFERENCES [dbo].[Users] ([Id]) ON DELETE CASCADE;
GO
ALTER TABLE [dbo].[WorkstationAssignments] ADD CONSTRAINT [FK_WorkstationAssignments_People_PersonId] FOREIGN KEY ([PersonId]) REFERENCES [dbo].[People] ([Id]) ON DELETE CASCADE;
GO
ALTER TABLE [dbo].[WorkstationAssignments] ADD CONSTRAINT [FK_WorkstationAssignments_Users_RequestedById] FOREIGN KEY ([RequestedById]) REFERENCES [dbo].[Users] ([Id]);
GO
ALTER TABLE [dbo].[WorkstationAttributes] ADD CONSTRAINT [FK_WorkstationAttributes_Workstations_WorkstationId] FOREIGN KEY ([WorkstationId]) REFERENCES [dbo].[Workstations] ([Id]) ON DELETE CASCADE;
GO
ALTER TABLE [dbo].[Workstations] ADD CONSTRAINT [FK_Workstations_Spaces_SpaceId] FOREIGN KEY ([SpaceId]) REFERENCES [dbo].[Spaces] ([Id]) ON DELETE CASCADE;
GO
ALTER TABLE [dbo].[Workstations] ADD CONSTRAINT [FK_Workstations_Teams_TeamId] FOREIGN KEY ([TeamId]) REFERENCES [dbo].[Teams] ([Id]) ON DELETE CASCADE;
GO
ALTER TABLE [dbo].[Workstations] ADD CONSTRAINT [FK_Workstations_WorkstationAssignments_WorkstationAssignmentId] FOREIGN KEY ([WorkstationAssignmentId]) REFERENCES [dbo].[WorkstationAssignments] ([Id]);
