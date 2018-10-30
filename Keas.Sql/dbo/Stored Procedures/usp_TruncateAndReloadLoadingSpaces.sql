

-- =============================================
-- Author:		Ken Taylor
-- Create date: August 22, 2018
-- Description:	Truncate the LoadingSpaces table and reload
-- Usage:
/*
	USE [KEAS]
	GO

	EXEC usp_TruncateAndReloadLoadingSpaces @IsDebug = 0

*/
-- Modifications:
--	20181030 by kjt: Added SqFt as per Scott K.
--
-- =============================================
CREATE PROCEDURE [dbo].[usp_TruncateAndReloadLoadingSpaces] 
	@IsDebug bit = 0 -- Change to 1 to print SQL only.
AS
BEGIN
	SET NOCOUNT ON;

	DECLARE @TSQL varchar(MAX) = ''

	SELECT @TSQL = '
	TRUNCATE TABLE [dbo].[LoadingSpaces]

	INSERT INTO [dbo].[LoadingSpaces] (
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
	  ,[SqFt]
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
	  ,[SqFt]
	  ,NULL AS [Source]
	  ,1 AS [Active]
  FROM [KEAS].[dbo].[vSpaceRooms]
'

    IF @IsDebug = 1
		PRINT @TSQL
	ELSE
		EXEC (@TSQL)
END