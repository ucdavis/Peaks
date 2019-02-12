public static class SpaceQueries {
    public static string List = @"select Space.*,
       Space.Id              as Id,
       EquipmentCount,
       COALESCE(KeyCount, 0) as KeyCount,
       WorkstationsTotalCount,
       WorkstationsInUseCount,      
      CONCAT_ws(',', WorkstationTags, KeyTags, EquipmentTags)
from (select Space.Id, count(Equipment.Id) as EquipmentCount, STRING_AGG(Tags, ',') as EquipmentTags
      from Spaces Space
             left join Equipment on Space.Id = Equipment.SpaceId and Equipment.Active = 1 and Equipment.TeamId = @teamId
      group by Space.Id) t1
       left outer join (select Space.Id, count(KeyXSpaces.Id) as KeyCount, STRING_AGG(Tags, ',') as KeyTags
                        from Spaces Space
                               left join KeyXSpaces on Space.Id = KeyXSpaces.SpaceId
                               inner join Keys K on KeyXSpaces.KeyId = K.Id and K.Active = 1 and K.TeamId = @teamId
                        group by Space.Id) t3 on t1.Id = t3.Id
       left outer join (select Space.Id, count(W.Id) as WorkstationsTotalCount, STRING_AGG(Tags, ',') as WorkstationTags
                        from Spaces Space
                               left join Workstations W on Space.Id = W.SpaceId and W.Active = 1 and W.TeamId = @teamId
                        group by Space.Id) t2 on t1.Id = t2.Id
       left outer join (select Space.Id, count(W.Id) as WorkstationsInUseCount
                        from Spaces Space
                               left join Workstations W
                                 on Space.Id = W.SpaceId and W.Active = 1 and W.WorkstationAssignmentId is not null and W.TeamId = @teamId
                        group by Space.Id) t4 on t1.Id = t4.Id
       inner join Spaces Space on Space.Id = t1.Id
       inner join FISOrgs on space.OrgId = FISOrgs.OrgCode
       where Space.Active = 1 AND FISOrgs.TeamId = @teamid";
}
