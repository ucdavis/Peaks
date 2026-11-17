using System;
using System.Globalization;
using System.Linq;
using System.Security.Claims;
using System.Threading;
using System.Threading.Tasks;
using Keas.Core.Data;
using Keas.Core.Domain;
using Microsoft.EntityFrameworkCore;
using OpenIddict.Abstractions;

namespace Keas.Mvc.Mcp;

public sealed class DemoInventory(ApplicationDbContext db, TimeProvider clock, DemoSettings settings)
{
    private static readonly TimeZoneInfo Pacific = TimeZoneInfo.FindSystemTimeZoneById("America/Los_Angeles");
    public DateTime Today => TimeZoneInfo.ConvertTime(clock.GetUtcNow(), Pacific).Date;

    public async Task DemandAccess(ClaimsPrincipal user, CancellationToken ct)
    {
        var id = user?.GetClaim(OpenIddictConstants.Claims.Subject);
        if (user?.Identity?.IsAuthenticated != true || !user.HasScope(DemoSettings.Scope) || string.IsNullOrEmpty(id))
            throw new DemoInputException("unauthorized", "Connect the PEAKS plugin first.");
        if (!await db.Users.AnyAsync(x => x.Id == id, ct) ||
            !(await db.SystemPermissions.AnyAsync(x => x.UserId == id && x.Role.Name == Role.Codes.Admin, ct) ||
              await db.TeamPermissions.AnyAsync(x => x.UserId == id && x.Team.Slug == DemoSettings.TeamSlug &&
                  (x.Role.Name == Role.Codes.DepartmentalAdmin || x.Role.Name == Role.Codes.EquipmentMaster), ct)))
            throw new DemoInputException("access_denied", "This PEAKS user cannot read the Sandbox Team equipment inventory.");
    }

    public object Context() => new { team = "Sandbox Team", fictionalData = true, timeZone = Pacific.Id,
        today = Day(Today), weekStartsOn = "Monday", weekStart = Day(WeekStart), weekEndExclusive = Day(WeekStart.AddDays(7)),
        meaningOfExpiration = "The equipment assignment/loan due date, not warranty or equipment retirement.",
        inventoryUrl = new Uri(settings.Issuer, "sandbox/equipment").AbsoluteUri };
    private DateTime WeekStart => Today.AddDays(-(((int)Today.DayOfWeek + 6) % 7));

    public async Task<object> People(string name, CancellationToken ct)
    {
        var text = Filter(name, "name", required: true).ToLowerInvariant();
        var query = db.People.AsNoTracking().Where(x => x.Team.Slug == DemoSettings.TeamSlug &&
            (x.FirstName + " " + x.LastName).ToLower().Contains(text));
        var total = await query.CountAsync(ct);
        var people = await query.OrderBy(x => x.LastName).ThenBy(x => x.FirstName).ThenBy(x => x.Id)
            .Select(x => new { personId = x.Id, name = x.FirstName + " " + x.LastName }).Take(20).ToListAsync(ct);
        return new { context = Context(), totalMatches = total, truncated = total > people.Count, people };
    }

    public async Task<object> Equipment(string query, string make, int? personId, bool unassignedOnly, int limit, CancellationToken ct)
    {
        if (limit < 1 || limit > 50) throw new DemoInputException("invalid_input", "limit must be between 1 and 50.");
        if (personId.HasValue && unassignedOnly) throw new DemoInputException("invalid_input", "A person's equipment cannot also be unassigned.");
        var text = Filter(query, "query").ToLowerInvariant();
        var manufacturer = Filter(make, "make").ToLowerInvariant();
        var rows = Inventory();
        if (text.Length > 0) rows = rows.Where(x => x.Name.ToLower().Contains(text) || x.Model.ToLower().Contains(text) || x.SerialNumber.ToLower().Contains(text));
        if (manufacturer.Length > 0) rows = rows.Where(x => x.Make.ToLower() == manufacturer);
        if (personId.HasValue)
        {
            if (!await db.People.AnyAsync(x => x.Id == personId && x.Team.Slug == DemoSettings.TeamSlug, ct))
                throw new DemoInputException("person_not_found", "Search for an active person in the Sandbox Team first.");
            rows = rows.Where(x => x.Assignment != null && x.Assignment.PersonId == personId);
        }
        if (unassignedOnly) rows = rows.Where(x => x.Assignment == null);
        return await Results(rows, limit, null, null, null, ct);
    }

    public async Task<object> Expiring(string period, CancellationToken ct)
    {
        DateTime? from;
        DateTime until;
        switch (period)
        {
            case "this_week": from = WeekStart; until = WeekStart.AddDays(7); break;
            case "next_7_days": from = Today; until = Today.AddDays(7); break;
            case "this_month": from = new DateTime(Today.Year, Today.Month, 1); until = from.Value.AddMonths(1); break;
            case "overdue": from = null; until = Today; break;
            default: throw new DemoInputException("invalid_input", "period must be this_week, next_7_days, this_month, or overdue.");
        }
        var rows = Inventory().Where(x => x.Assignment != null && x.Assignment.ExpiresAt < until);
        if (from.HasValue) rows = rows.Where(x => x.Assignment.ExpiresAt >= from.Value);
        return await Results(rows, 50, period, from, until, ct);
    }

    private IQueryable<Equipment> Inventory() => db.Equipment.AsNoTracking().Where(x => x.Team.Slug == DemoSettings.TeamSlug &&
        (x.Assignment == null || (x.Assignment.Person.Active && x.Assignment.Person.TeamId == x.TeamId)));

    private async Task<object> Results(IQueryable<Equipment> query, int limit, string period, DateTime? from, DateTime? until, CancellationToken ct)
    {
        var total = await query.CountAsync(ct);
        var rows = await query.OrderBy(x => x.Assignment == null).ThenBy(x => x.Assignment.ExpiresAt).ThenBy(x => x.Id)
            .Select(x => new { id = x.Id, name = x.Name, make = x.Make, model = x.Model, serialNumber = x.SerialNumber,
                personId = x.Assignment == null ? (int?)null : x.Assignment.PersonId,
                person = x.Assignment == null ? null : x.Assignment.Person.FirstName + " " + x.Assignment.Person.LastName,
                expires = x.Assignment == null ? (DateTime?)null : x.Assignment.ExpiresAt,
                confirmed = x.Assignment != null && x.Assignment.IsConfirmed })
            .Take(limit).ToListAsync(ct);
        return new { context = Context(), period, startDate = Day(from), endDateExclusive = Day(until), totalMatches = total,
            truncated = total > rows.Count, equipment = rows.Select(x => new { x.id, x.name, x.make, x.model, x.serialNumber,
                x.personId, x.person, expiresOn = Day(x.expires), overdue = x.expires.HasValue && x.expires.Value.Date < Today,
                assignmentConfirmed = x.confirmed }) };
    }

    private static string Day(DateTime? date) => date?.ToString("yyyy-MM-dd", CultureInfo.InvariantCulture);
    private static string Filter(string value, string field, bool required = false)
    {
        var text = value?.Trim() ?? "";
        if ((required && text.Length == 0) || text.Length > 100 || text.Any(char.IsControl))
            throw new DemoInputException("invalid_input", field + " must be plain text, at most 100 characters.");
        return text;
    }
}

public sealed class DemoInputException(string code, string message) : Exception(message)
{
    public string Code { get; } = code;
}
