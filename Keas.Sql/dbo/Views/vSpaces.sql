

/*
	Author: Ken Taylor
	Created: October 30, 2018
	Name: [dbo].[vSpaces]
	Description: Return a list of spaces for any given department space.
	Usage:

	SELECT * FROM [dbo].[vSpaces]

	Modifications: 
		20181030 by kjt: Added SUM(dbo.DeptSpace.Room_Share_Square_Feet)
			for SqFt as per Scott K.
*/

CREATE VIEW [dbo].[vSpaces]   
AS
SELECT        
	dbo.Dept.Space_Acctng_Dept_Key AS DeptKey, 
	dbo.DeptSpace.Room_Key AS RoomKey, 
	dbo.Dept.fis_chart_num AS ChartNum, 
	dbo.Dept.fis_org_id AS OrgId, 
	dbo.Dept.dept_name AS DeptName,
	SUM(dbo.DeptSpace.Room_Share_Square_Feet) AS SqFt

FROM dbo.Dept 
INNER JOIN dbo.DeptSpace ON 
	dbo.Dept.Space_Acctng_Dept_Key = dbo.DeptSpace.Space_Acctng_Dept_Key
	--WHERE dbo.Dept.[Space_Acctng_Dept_Key] = 'DV-01-00014' AND  Bldg_Key = 'DV-01-000233' AND Floor_Key= 'DV-01-0000234' AND Room_Key = 'DV-01-00004871'
GROUP BY 
	dbo.Dept.Space_Acctng_Dept_Key, 
	dbo.DeptSpace.Room_Key, 
	dbo.Dept.fis_chart_num,
	dbo.Dept.fis_org_id, 
	dbo.Dept.dept_name
GO



GO


