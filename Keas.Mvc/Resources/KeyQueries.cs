public static class KeyQueries
{
    public static string List = @"
    select Keys.*, COALESCE(SpacesCount, 0) as SpacesCount, SerialsInUseCount, SerialsTotalCount
from (select Keys.Id, count(S2.Id) as SpacesCount
      from Keys
             left join KeyXSpaces S2 on Keys.Id = S2.KeyId
      group by Keys.Id) t1
       left outer join (select Keys.Id, count(S3.Id) as SerialsInUseCount
                        from Keys
                               left join KeySerials S3 on Keys.Id = S3.KeyId and S3.TeamId = @teamid and S3.Active = 1 and
                                                          S3.KeySerialAssignmentId is not null
                        group by Keys.Id) t2 on t1.Id = t2.Id
       left outer join (select Keys.Id, count(S3.Id) as SerialsTotalCount
                        from Keys
                               left join KeySerials S3 on Keys.Id = S3.KeyId and S3.TeamId = @teamid and S3.Active = 1
                        group by Keys.Id) t3 on t1.Id = t3.Id
       left outer join Keys on Keys.Id = t1.Id
where Keys.Active = 1
  and Keys.TeamId = @teamid;
    ";
}
