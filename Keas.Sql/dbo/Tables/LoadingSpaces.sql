CREATE TABLE [dbo].[LoadingSpaces](
	[DeptKey] [varchar](11) NOT NULL,
	[BldgKey] [varchar](12) NOT NULL,
	[FloorKey] [varchar](13) NOT NULL,
	[RoomKey] [varchar](14) NOT NULL,
	[ChartNum] [varchar](2) NULL,
	[OrgId] [varchar](4) NULL,
	[DeptName] [varchar](100) NULL,
	[BldgName] [varchar](100) NULL,
	[FloorName] [varchar](25) NULL,
	[RoomNumber] [varchar](10) NULL,
	[RoomName] [varchar](150) NULL,
	[RoomCategoryName] [varchar](20) NULL,
	[RoomCategoryCode] [varchar](5) NULL,
	[SqFt] [int] NULL,
	[Source] [varchar](100) NULL,
	[Active] [bit] NULL,
 CONSTRAINT [PK_LoadingSpace] PRIMARY KEY CLUSTERED 
(
	[DeptKey] ASC,
	[RoomKey] ASC
)WITH (STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO


