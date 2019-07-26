
UPDATE [dbo].[Equipment]
   SET [Is3ProtectionLevel] = 'P1'
      ,[Is3AvailabilityLevel] = 'A1'
 where Is3ProtectionLevel is null and type in ('Computer', 'Desktop', 'Laptop', 'Server', 'Cellphone', 'Device')
GO
