/****** Script for SelectTopNRows command from SSMS  ******/

/*
	Author: Ken Taylor
	Created: October 30, 2018
	Name: [dbo].vSpaceRooms]
	Description: Return a list of spaces for any given department space.
	Usage:

	SELECT * FROM [dbo].[vSpaceRooms]

	Modifications: 
		20181030 by kjt: Added new column SqFt as per Scott K.
			for SqFt as per Scott K.
*/
CREATE VIEW [dbo].[vSpaceRooms]

AS
SELECT        s.DeptKey, r.BldgKey, r.FloorKey, s.RoomKey, s.ChartNum, s.OrgId, s.DeptName, r.BldgName, r.FloorName, r.RoomNumber, r.RoomName, r.RoomCategoryName, r.RoomCategoryCode, s.SqFt
FROM            dbo.vSpaces AS s INNER JOIN
                         dbo.vRooms AS r ON r.RoomKey = s.RoomKey
GROUP BY s.DeptKey, r.BldgKey, r.FloorKey, s.RoomKey, s.ChartNum, s.OrgId, s.DeptName, r.BldgName, r.FloorName, r.RoomNumber, r.RoomName, r.RoomCategoryName, r.RoomCategoryCode, s.SqFt
GO