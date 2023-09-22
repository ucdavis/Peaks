public static class PeopleQueries
{
    public static string List = @"select People.*, U.Pronouns, SUP.FirstName SupervisorFirstName, SUP.LastName SupervisorLastName, SUP.Email SupervisorEmail, SUP.UserId SupervisorUserId, EquipmentCount, AccessCount, KeyCount, WorkstationCount,
    cast(CASE WHEN EXISTS(SELECT * FROM People emp WHERE emp.SupervisorId = people.id) THEN 1 ELSE 0 END as bit) as isSupervisor
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
    left outer join People SUP on People.SupervisorId = SUP.Id
    left outer join Users U on People.UserId = U.Id
where (People.Active = @active1 or People.Active = @active2) and People.TeamId = @teamId;";


    private static string PeopleLeavingCommon =
        @"select People.*, SUP.FirstName SupervisorFirstName, SUP.LastName SupervisorLastName, SUP.Email SupervisorEmail, EquipmentCount, AccessCount, KeyCount, WorkstationCount, Teams.Slug
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
    left outer join People SUP on People.SupervisorId = SUP.Id
    INNER JOIN
         Teams ON People.TeamId = dbo.Teams.Id ";



    public static string PeopleLeavingWithAssets =  @$"{PeopleLeavingCommon}
where (People.Active = 0 or (People.EndDate is not null and People.EndDate <= @enddate)) and (EquipmentCount > 0 or AccessCount > 0 or KeyCount > 0 or WorkstationCount > 0) and People.TeamId = @teamId;";

    public static string PeopleLeavingWithAssetsInGroup = @$"{PeopleLeavingCommon}
where (People.Active = 0 or (People.EndDate is not null and People.EndDate <= @enddate)) and (EquipmentCount > 0 or AccessCount > 0 or KeyCount > 0 or WorkstationCount > 0) and People.TeamId in @teamIds;";
}
