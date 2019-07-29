
UPDATE [dbo].[Equipment]
   SET [ProtectionLevel] = 'P1'
      ,[AvailabilityLevel] = 'A1'
 where ProtectionLevel is null and type in ('Computer', 'Desktop', 'Laptop', 'Server', 'Cellphone', 'Device')
GO
