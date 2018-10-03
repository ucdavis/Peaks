
-- =============================================
-- Author:      Ken Taylor
-- Create Date: August 22, 2018
-- Description: Merge records from LoadingSpace into Space table.
-- Usage:
/*
	USE [KEAS]
	GO

	EXEC usp_MergeSpaceTable @IsDebug = 0 -- Set to 1 to print SQL only.
*/
-- Modifications:
--
-- =============================================
CREATE PROCEDURE [dbo].[usp_MergeSpaceTable]
(
    -- Add the parameters for the stored procedure here
    @IsDebug bit = 0
)
AS
BEGIN
    -- SET NOCOUNT ON added to prevent extra result sets from
    -- interfering with SELECT statements.
    SET NOCOUNT ON

    DECLARE @TSQL varchar(MAX) = ''

	SELECT @TSQL = '
MERGE [dbo].[Space] AS target
USING (
	SELECT 
	   [DeptKey]
      ,[BldgKey]
      ,[FloorKey]
      ,[RoomKey]
      ,[ChartNum]
      ,[OrgId]
      ,[DeptName]
      ,[BldgName]
      ,[FloorName]
      ,[RoomNumber]
      ,[RoomName]
      ,[RoomCategoryName]
      ,[RoomCategoryCode]
	  ,[Source]
	  ,[Active]
	FROM [dbo].[LoadingSpace]
) AS source (
	   [DeptKey]
      ,[BldgKey]
      ,[FloorKey]
      ,[RoomKey]
      ,[ChartNum]
      ,[OrgId]
      ,[DeptName]
      ,[BldgName]
      ,[FloorName]
      ,[RoomNumber]
      ,[RoomName]
      ,[RoomCategoryName]
      ,[RoomCategoryCode]
	  ,[Source]
	  ,[Active])
ON (target.[DeptKey] = source.[DeptKey] AND target.[RoomKey] = source.[RoomKey])
WHEN MATCHED THEN UPDATE SET
	   target.[BldgKey]			 =	source.[BldgKey]
      ,target.[FloorKey]		 =	source.[FloorKey]
      ,target.[ChartNum]		 =	source.[ChartNum]
      ,target.[OrgId]			 =	source.[OrgId]
      ,target.[DeptName]		 =	source.[DeptName]
      ,target.[BldgName]		 =	source.[BldgName]
      ,target.[FloorName]		 =	source.[FloorName]
      ,target.[RoomNumber]		 =	source.[RoomNumber]
      ,target.[RoomName]		 =	source.[RoomName]
      ,target.[RoomCategoryName] =	source.[RoomCategoryName]
      ,target.[RoomCategoryCode] =	source.[RoomCategoryCode]
	  ,target.[Source]			 =	source.[Source]
	  ,target.[Active]			 =	source.[Active]
WHEN NOT MATCHED BY TARGET THEN INSERT VALUES (
	   [DeptKey]
      ,[BldgKey]
      ,[FloorKey]
      ,[RoomKey]
      ,[ChartNum]
      ,[OrgId]
      ,[DeptName]
      ,[BldgName]
      ,[FloorName]
      ,[RoomNumber]
      ,[RoomName]
      ,[RoomCategoryName]
      ,[RoomCategoryCode]
	  ,[Source]
	  ,[Active]
)
WHEN NOT MATCHED BY SOURCE THEN UPDATE
	SET [Active] = 0
;'

	IF @IsDebug = 1
		PRINT @TSQL
	ELSE
		EXEC (@TSQL)

END