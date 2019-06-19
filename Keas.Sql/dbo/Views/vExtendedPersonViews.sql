CREATE VIEW dbo.vExtendedPersonViews
AS
SELECT        dbo.People.Id, dbo.People.UserId, dbo.People.SupervisorId, People_1.FirstName AS S_FirstName, People_1.LastName AS S_LastName, People_1.Email AS S_Email, dbo.People.FirstName, dbo.People.LastName, 
                         dbo.People.Email, dbo.People.Tags, dbo.People.StartDate, dbo.People.EndDate, dbo.People.Category, dbo.Teams.Slug, MAX(dbo.PersonNotifications.ActionDate) AS LastAddDate
FROM            dbo.People LEFT OUTER JOIN
                         dbo.Teams ON dbo.People.TeamId = dbo.Teams.Id LEFT OUTER JOIN
                         dbo.People AS People_1 ON dbo.People.SupervisorId = People_1.Id LEFT OUTER JOIN
                         dbo.PersonNotifications ON dbo.People.Id = dbo.PersonNotifications.PersonId
WHERE        (dbo.People.Active = 1)
GROUP BY dbo.People.Id, dbo.People.UserId, People_1.FirstName, People_1.LastName, People_1.Email, dbo.People.FirstName, dbo.People.LastName, dbo.People.Email, dbo.People.Tags, dbo.People.StartDate, dbo.People.EndDate, 
                         dbo.People.Category, dbo.Teams.Slug, dbo.People.SupervisorId
GO
