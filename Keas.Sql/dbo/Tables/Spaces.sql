CREATE TABLE [dbo].[Spaces](
	[Id] [int] IDENTITY(1,1) NOT NULL,
	[Active] [bit] NOT NULL,
	[BldgKey] [nvarchar](25) NULL,
	[BldgName] [nvarchar](128) NULL,
	[ChartNum] [nvarchar](2) NULL,
	[DeptKey] [nvarchar](25) NULL,
	[DeptName] [nvarchar](128) NULL,
	[FloorKey] [nvarchar](25) NULL,
	[FloorName] [nvarchar](128) NULL,
	[OrgId] [nvarchar](10) NULL,
	[RoomCategoryCode] [nvarchar](5) NULL,
	[RoomCategoryName] [nvarchar](128) NULL,
	[RoomKey] [nvarchar](25) NULL,
	[RoomName] [nvarchar](200) NULL,
	[RoomNumber] [nvarchar](25) NULL,
	[SqFt] [int] NULL,
	[Source] [nvarchar](50) NULL,
 CONSTRAINT [PK_Spaces] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO

/****** Object:  Index [IX_Spaces_Active]    Script Date: 10/30/2018 2:38:58 PM ******/
CREATE NONCLUSTERED INDEX [IX_Spaces_Active] ON [dbo].[Spaces]
(
	[Active] DESC
)WITH (STATISTICS_NORECOMPUTE = OFF, DROP_EXISTING = OFF, ONLINE = OFF) ON [PRIMARY]
GO

/****** Object:  Index [IX_Spaces_OrgId]    Script Date: 10/30/2018 2:39:10 PM ******/
CREATE NONCLUSTERED INDEX [IX_Spaces_OrgId] ON [dbo].[Spaces]
(
	[OrgId] ASC
)WITH (STATISTICS_NORECOMPUTE = OFF, DROP_EXISTING = OFF, ONLINE = OFF) ON [PRIMARY]
GO
