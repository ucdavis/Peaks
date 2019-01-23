public static class PeopleQueries
{
    public static string List = @"select People.*, EquipmentCount, AccessCount, KeyCount, WorkstationCount
from (select People.Id, count(E.Id) as EquipmentCount
      from People
             left join EquipmentAssignments E on People.Id = E.PersonId
      group by People.Id) t1
    left outer join (
        select People.Id, count(Assignment.Id) as AccessCount
        from People
        left join AccessAssignments Assignment on People.Id = Assignment.PersonId
        group by People.Id
      ) t2 on t1.Id = t2.Id
    left outer join (
      select People.Id, count(K.Id) KeyCount
      from People
      left join KeySerialAssignments K on People.Id = K.PersonId
      group by People.Id
    ) t3 on t1.Id = t3.Id
     inner join People on People.Id = t1.Id
    left outer join (
      select People.Id, count(WA.Id) WorkstationCount
      from People
      left join WorkstationAssignments WA on People.Id = WA.PersonId
      group by People.Id
    ) t4 on t1.Id = t4.Id
where People.Active = 1 and People.TeamId = @teamId;";
}
