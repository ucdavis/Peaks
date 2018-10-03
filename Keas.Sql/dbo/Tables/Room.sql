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

