

CREATE VIEW [dbo].[vRooms] 
AS
SELECT        dbo.Bldg.Bldg_Key AS BldgKey, dbo.Room.Floor_Key AS FloorKey, dbo.Room.Room_Key AS RoomKey, dbo.Bldg.Primary_Display_Name AS BldgName, dbo.Room.Floor_Name AS FloorName, 
                         dbo.Room.Room AS RoomNumber, dbo.Room.Room_Name AS RoomName, dbo.Room.Room_Category_Name AS RoomCategoryName, dbo.Room.Room_Category_Code AS RoomCategoryCode
FROM            dbo.Bldg INNER JOIN
                         dbo.Room ON dbo.Bldg.Bldg_Key = dbo.Room.Bldg_Key