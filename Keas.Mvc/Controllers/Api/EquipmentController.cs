using Keas.Core.Data;
using Keas.Core.Domain;
using Keas.Mvc.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Mime;
using System.Threading.Tasks;
using Keas.Core.Models;
using Keas.Mvc.Extensions;
using Keas.Mvc.Models;
using Keas.Core.Extensions;

namespace Keas.Mvc.Controllers.Api
{
    [Authorize(Policy = AccessCodes.Codes.EquipMasterAccess)]
    [ApiController]
    [Route("api/{teamName}/equipment/[action]")]
    [Produces(MediaTypeNames.Application.Json)]
    public class EquipmentController : SuperController
    {
        private readonly ApplicationDbContext _context;
        private readonly IEventService _eventService;
        private readonly IServiceNowService _serviceNowService;
        private readonly ISecurityService _securityService;

        public EquipmentController(ApplicationDbContext context, IEventService eventService, IServiceNowService serviceNowService, ISecurityService securityService)
        {
            _context = context;
            _eventService = eventService;
            _serviceNowService = serviceNowService;
            _securityService = securityService;
        }

        [ApiExplorerSettings(IgnoreApi = true)]
        public string GetTeam()
        {
            return Team;
        }

        [HttpGet]
        [ProducesResponseType(typeof(IEnumerable<Equipment>), StatusCodes.Status200OK)]
        public async Task<IActionResult> Search(string q)
        {
            var equipment =
                from eq in _context.Equipment
                .Where(x => x.Team.Slug == Team && x.Active &&
                (EF.Functions.Like(x.Name,q.EfStartsWith()) || EF.Functions.Like(x.SerialNumber, q.EfStartsWith())))
                .Include(x => x.Attributes)
                .Include(x => x.Space).Include(x => x.Assignment)
                .OrderBy(x => x.Assignment != null).ThenBy(x => x.Name)
                .AsNoTracking()
                select new
                {
                    equipment = eq,
                    label = eq.Id + ". " + eq.Name + " " + eq.SerialNumber,
                };

            return Json(await equipment.ToListAsync());
        }

        [HttpGet]
        [ProducesResponseType(typeof(IEnumerable<Equipment>), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetEquipmentInSpace(int spaceId)
        {
            var equipment = await _context.Equipment
                .Where(x => x.Space.Id == spaceId && x.Team.Slug == Team && x.Active)
                .Include(x => x.Space)
                .Include(x => x.Attributes)
                .Include(x => x.Team)
                .Include(x => x.Assignment)
                .ThenInclude(x => x.Person)
                .AsNoTracking()
                .ToListAsync();
            return Json(equipment);
        }

        [HttpGet]
        [ProducesResponseType(typeof(IEnumerable<EquipmentAttributeKey>), StatusCodes.Status200OK)]
        public async Task<IActionResult> CommonAttributeKeys()
        {
            var keys = await _context.EquipmentAttributeKeys
                .Where(a => a.TeamId == null || a.Team.Slug == Team)
                .OrderBy(a => a.Key)
                .Select(a => a.Key).AsNoTracking().ToListAsync();

            return Json(keys);
        }

        [HttpGet]
        [ProducesResponseType(typeof(IEnumerable<Type>), StatusCodes.Status200OK)]
        public ActionResult ListEquipmentTypes() => Json(EquipmentTypes.Types);

        [HttpGet]
        [ProducesResponseType(typeof(IEnumerable<Equipment>), StatusCodes.Status200OK)]
        public async Task<IActionResult> ListAssigned(int personId)
        {
            var equipmentAssignments = await _context.Equipment
                .Where(x => x.Assignment.PersonId == personId && x.Team.Slug == Team)
                .Include(x => x.Assignment)
                .ThenInclude(x => x.Person)
                .Include(x => x.Space)
                .Include(x => x.Attributes)
                .Include(x => x.Team)
                .AsNoTracking().ToArrayAsync();

            return Json(equipmentAssignments);
        }

        /// <summary>
        /// List all equipments for a team
        /// </summary>
        /// <param name="filter">0 = ShowActive, 1 = ShowInactive, 2 = ShowAll. Defaults to Show Active</param>
        /// <returns></returns>
        [HttpGet]
        [ProducesResponseType(typeof(IEnumerable<Equipment>), StatusCodes.Status200OK)]
        public async Task<IActionResult> List(ApiParameterModels.Filter filter = ApiParameterModels.Filter.ShowActive)
        {
            var equipmentQuery = _context.Equipment
                .Where(x => x.Team.Slug == Team)
                .Include(x => x.Assignment)
                .ThenInclude(x => x.Person)
                .Include(x => x.Space)
                .Include(x => x.Attributes)
                .Include(x => x.Team)
                .AsNoTracking();

            switch (filter)
            {
                case ApiParameterModels.Filter.ShowActive:
                    //Use defaults
                    break;
                case ApiParameterModels.Filter.ShowInactive:
                    equipmentQuery = equipmentQuery.IgnoreQueryFilters().Where(a => !a.Active);
                    break;
                case ApiParameterModels.Filter.ShowAll:
                    equipmentQuery = equipmentQuery.IgnoreQueryFilters();
                    break;
                default:
                    throw new Exception("Unknown filter value");
            }

            var equipments = await equipmentQuery.ToArrayAsync();


            return Json(equipments);
        }


        [HttpGet("{id}")]
        [ProducesResponseType(typeof(Equipment), StatusCodes.Status200OK)]
        public async Task<IActionResult> Details(int id, bool showDeleted = false)
        {

            var equipmentQuery = _context.Equipment
                .Where(x => x.Team.Slug == Team)
                .Include(x => x.Assignment)
                .ThenInclude(x => x.Person)
                .Include(x => x.Space)
                .Include(x => x.Attributes)
                .Include(x => x.Team)
                .AsNoTracking();


            if (showDeleted)
            {
                equipmentQuery = equipmentQuery.IgnoreQueryFilters();
            }

            var equipment = await equipmentQuery.SingleOrDefaultAsync(x => x.Id == id);

            if (equipment == null)
            {
                return NotFound();
            }
            return Json(equipment);
        }

        [HttpPost]
        [ProducesResponseType(typeof(Equipment), StatusCodes.Status200OK)]
        [Consumes(MediaTypeNames.Application.Json)]
        public async Task<IActionResult> Create([FromBody]Equipment equipment)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest();
            }
            if (equipment.Id != 0) // if creating new equipment, this should always be 0
            {
                return BadRequest();
            }
            //Validate passed team matches equipment team.
            if (!await _securityService.IsTeamValid(Team, equipment.TeamId))
            {
                return BadRequest("Invalid Team");
            }


            if (string.IsNullOrWhiteSpace(equipment.Type))
            {
                equipment.Type = EquipmentTypes.Default;
            }
            if (!EquipmentTypes.Types.Contains(equipment.Type))
            {
                return BadRequest("Invalid Equipment Type");
            }


            if (equipment.Space != null)
            {
                //Validate Team has space.
                if (!await _securityService.IsSpaceInTeam(Team, equipment.Space.Id))
                {
                    return BadRequest("Space not in Team");
                }
                var space = await _context.Spaces.SingleAsync(x => x.Id == equipment.Space.Id);
                equipment.Space = space;
            }

            UpdateTypeSpecificFields(equipment);
            if (EquipmentTypes.Is3Types.Contains(equipment.Type, StringComparer.OrdinalIgnoreCase))
            {
                if (!ProtectionLevels.Levels.Contains(equipment.ProtectionLevel))
                {
                    return BadRequest("Invalid Protection Level");
                }
                if (!AvailabilityLevels.Levels.Contains(equipment.AvailabilityLevel))
                {
                    return BadRequest("Invalid Availability Level");
                }
            }

            _context.Equipment.Add(equipment);
            await _eventService.TrackCreateEquipment(equipment);
            await _context.SaveChangesAsync();

            return Json(equipment);
        }

        [HttpPost]
        [ProducesResponseType(typeof(Equipment), StatusCodes.Status200OK)]
        public async Task<IActionResult> Assign(int equipmentId, int personId, string date)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            if (!await _securityService.IsPersonInTeam(Team, personId))
            {
                return BadRequest("User is not part of this team!");
            }

            var equipment = await _context.Equipment.Where(x => x.Team.Slug == Team && x.Active)
                .Include(x => x.Space)
                .Include(x => x.Assignment)
                .ThenInclude(a => a.Person)
                .SingleAsync(x => x.Id == equipmentId);

            //TODO: Change to .SingleOrDefaultAsync() and return a nice not found instead of throwing an exception?

            var requestedByPerson = await _securityService.GetPerson(Team);

            if (equipment.Assignment != null)
            {
                _context.EquipmentAssignments.Update(equipment.Assignment);
                equipment.Assignment.ExpiresAt = DateTime.Parse(date); //TODO: Validate date is in the future...
                equipment.Assignment.RequestedById = requestedByPerson.UserId;
                equipment.Assignment.RequestedByName = requestedByPerson.Name;
                await _eventService.TrackEquipmentAssignmentUpdated(equipment);
            }
            else
            {
                equipment.Assignment = new EquipmentAssignment { PersonId = personId, ExpiresAt = DateTime.Parse(date) };
                equipment.Assignment.Person = await _context.People.SingleAsync(p => p.Id == personId);
                equipment.Assignment.RequestedById = requestedByPerson.UserId;
                equipment.Assignment.RequestedByName = requestedByPerson.Name;

                _context.EquipmentAssignments.Add(equipment.Assignment);
                await _eventService.TrackAssignEquipment(equipment);
            }
            await _context.SaveChangesAsync();
            return Json(equipment);

        }

        [HttpPost]
        [ProducesResponseType(typeof(Equipment), StatusCodes.Status200OK)]
        [Consumes(MediaTypeNames.Application.Json)]
        public async Task<IActionResult> Update([FromBody]Equipment updatedEquipment)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest();
            }
            var eq = await _context.Equipment.Where(x => x.Team.Slug == Team)
                .Include(x => x.Space).Include(x => x.Attributes)
                .SingleAsync(x => x.Id == updatedEquipment.Id);

            UpdateTypeSpecificFields(updatedEquipment);

            eq.Make = updatedEquipment.Make;
            eq.Model = updatedEquipment.Model;
            eq.Name = updatedEquipment.Name;
            eq.SerialNumber = updatedEquipment.SerialNumber;
            eq.Tags = updatedEquipment.Tags;
            eq.Notes = updatedEquipment.Notes;
            eq.Type = updatedEquipment.Type;
            eq.ProtectionLevel = updatedEquipment.ProtectionLevel;
            eq.AvailabilityLevel = updatedEquipment.AvailabilityLevel;
            eq.SystemManagementId = updatedEquipment.SystemManagementId;

            if (string.IsNullOrWhiteSpace(eq.Type))
            {
                eq.Type = EquipmentTypes.Default;
            }
            if (!EquipmentTypes.Types.Contains(eq.Type))
            {
                return BadRequest("Invalid Equipment Type");
            }

            if (EquipmentTypes.Is3Types.Contains(eq.Type, StringComparer.OrdinalIgnoreCase))
            {
                if (!ProtectionLevels.Levels.Contains(eq.ProtectionLevel))
                {
                    return BadRequest("Invalid Protection Level");
                }
                if (!AvailabilityLevels.Levels.Contains(eq.AvailabilityLevel))
                {
                    return BadRequest("Invalid Availability Level");
                }
            }


            eq.Attributes.Clear();
            updatedEquipment.Attributes.ForEach(x => eq.AddAttribute(x.Key, x.Value));

            if (updatedEquipment.Space == null)
            {
                eq.Space = null;
            }
            else
            {
                //Validate Team has space.
                if (!await _securityService.IsSpaceInTeam(Team, updatedEquipment.Space.Id))
                {
                    return BadRequest("Space not in Team");
                }
                eq.Space = await _context.Spaces.SingleAsync(x => x.Id == updatedEquipment.Space.Id);
            }
            await _eventService.TrackUpdateEquipment(eq);
            await _context.SaveChangesAsync();
            return Json(eq);
        }

        private static void UpdateTypeSpecificFields(Equipment updatedEquipment)
        {
            if (!EquipmentTypes.Is3Types.Contains(updatedEquipment.Type, StringComparer.OrdinalIgnoreCase))
            {
                updatedEquipment.ProtectionLevel = null;
                updatedEquipment.AvailabilityLevel = null;
            }
            else
            {
                if (string.IsNullOrWhiteSpace(updatedEquipment.ProtectionLevel))
                {
                    updatedEquipment.ProtectionLevel = ProtectionLevels.P1;
                }

                if (string.IsNullOrWhiteSpace(updatedEquipment.AvailabilityLevel))
                {
                    updatedEquipment.AvailabilityLevel = AvailabilityLevels.A1;
                }
            }

            if (!EquipmentTypes.ManagedSystemTypes.Contains(updatedEquipment.Type, StringComparer.OrdinalIgnoreCase))
            {
                updatedEquipment.SystemManagementId = null;
            }
        }

        [HttpPost("{id}")]
        [ProducesResponseType(typeof(Equipment), StatusCodes.Status200OK)]
        public async Task<IActionResult> Revoke(int id)
        {
            var equipment = await _context.Equipment.Where(x => x.Team.Slug == Team)
                .Include(x => x.Assignment).ThenInclude(x => x.Person)
                .Include(x => x.Team)
                .SingleAsync(x => x.Id == id);
            if (equipment == null) //This isn't possible unless we change the SingleAsync above
            {
                return NotFound();
            }
            if (equipment.Assignment == null)
            {
                return BadRequest();
            }

            await _eventService.TrackUnAssignEquipment(equipment);
            _context.EquipmentAssignments.Remove(equipment.Assignment);
            await _context.SaveChangesAsync();
            return Json(null);

        }

        [HttpPost("{id}")]
        [ProducesResponseType(typeof(Equipment), StatusCodes.Status200OK)]
        public async Task<IActionResult> Delete(int id)
        {
            var equipment = await _context.Equipment.Where(x => x.Team.Slug == Team)
                .Include(x => x.Assignment).ThenInclude(x => x.Person)
                .Include(x => x.Team)
                .SingleAsync(x => x.Id == id);

            if (equipment == null)//This isn't possible unless we change the SingleAsync above
            {
                return NotFound();
            }

            if (!equipment.Active)
            {
                return BadRequest(ModelState);
            }

            using (var transaction = _context.Database.BeginTransaction())
            {

                _context.Equipment.Update(equipment);

                if (equipment.Assignment != null)
                {
                    await _eventService.TrackUnAssignEquipment(equipment); // call before we remove person info
                    _context.EquipmentAssignments.Remove(equipment.Assignment);
                }

                equipment.Active = false;
                await _eventService.TrackEquipmentDeleted(equipment);
                await _context.SaveChangesAsync();
                transaction.Commit();
                return Json(null);
            }

        }

        /// <summary>
        /// Takes the top 5 history records
        /// </summary>
        /// <param name="id"></param>
        /// <param name="max">Defaults to 5</param>
        /// <returns></returns>
        [HttpGet("{id}")]
        [ProducesResponseType(typeof(IEnumerable<History>), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetHistory(int id, int max = 5)
        {
            var history = await _context.Histories
                .Where(x => x.AssetType == "Equipment" && x.Equipment.Team.Slug == Team && x.EquipmentId == id)
                .OrderByDescending(x => x.ActedDate)
                .Take(max)
                .AsNoTracking().ToListAsync();

            return Json(history);
        }

        [HttpGet("{id}")]
        [ProducesResponseType(typeof(IEnumerable<ServiceNowPropertyWrapper>), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetComputer(string id)
        {
            try
            {
                var results = await this._serviceNowService.GetComputer(id);
                if (results.Results.Count == 0)
                {
                    return NotFound();
                }
                else
                {
                    return Json(results);
                }
            }
            catch (ServiceNowService.ServiceNowApiException ex) 
            {
                if (ex.StatusCode == System.Net.HttpStatusCode.Forbidden)
                {
                    return StatusCode(403);
                }
                else
                {
                    throw;
                }
            } 
        }

        [HttpGet]
        [ProducesResponseType(typeof(IEnumerable<ServiceNowPropertyWrapper>), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetComputersBySearch(string value)
        {
            var results = await this._serviceNowService.GetComputersByProperty(value);

            if (results.Results.Count == 0)
            {
                return NotFound();
            }
            else
            {
                return Json(results);
            }
    }
    }
}
