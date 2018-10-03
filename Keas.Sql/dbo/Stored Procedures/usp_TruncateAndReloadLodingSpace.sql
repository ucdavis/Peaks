
-- =============================================
-- Author:		Ken Taylor
-- Create date: August 22, 2018
-- Description:	Truncate the LocalSpace table and reload
-- Usage:
/*
	USE [KEAS]
	GO

	EXEC usp_TruncateAndReloadLodingSpace @IsDebug = 0

*/
-- Modifications:
--
-- =============================================
CREATE PROCEDURE [dbo].[usp_TruncateAndReloadLodingSpace] 
	@IsDebug bit = 0 -- Change to 1 to print SQL only.
AS
BEGIN
	SET NOCOUNT ON;

	DECLARE @TSQL varchar(MAX) = ''

	SELECT @TSQL = '
	TRUNCATE TABLE [dbo].[LoadingSpace]

	INSERT INTO [dbo].[LoadingSpace] (
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
	  ,NULL AS [Source]
	  ,1 AS [Active]
  FROM [KEAS].[dbo].[vSpaceRooms]
'

    IF @IsDebug = 1
		PRINT @TSQL
	ELSE
		EXEC (@TSQL)
END