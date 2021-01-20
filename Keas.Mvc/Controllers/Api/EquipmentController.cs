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

        public EquipmentController(ApplicationDbContext context, IEventService eventService, IServiceNowService serviceNowService)
        {
            this._context = context;
            _eventService = eventService;
            this._serviceNowService = serviceNowService;
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
            if (equipment.Space != null)
            {
                var space = await _context.Spaces.SingleAsync(x => x.Id == equipment.Space.Id);
                equipment.Space = space;
            }

            UpdateTypeSpecificFields(equipment);

            _context.Equipment.Add(equipment);
            await _eventService.TrackCreateEquipment(equipment);
            await _context.SaveChangesAsync();

            return Json(equipment);
        }

        [HttpPost]
        [ProducesResponseType(typeof(Equipment), StatusCodes.Status200OK)]
        public async Task<IActionResult> Assign(int equipmentId, int personId, string date)
        {
            // TODO Make sure user has permssion, make sure equipment exists, makes sure equipment is in this team
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            var equipment = await _context.Equipment.Where(x => x.Team.Slug == Team && x.Active)
                .Include(x => x.Space).Include(x => x.Assignment).ThenInclude(a => a.Person).SingleAsync(x => x.Id == equipmentId);

            if (equipment.Assignment != null)
            {
                _context.EquipmentAssignments.Update(equipment.Assignment);
                equipment.Assignment.ExpiresAt = DateTime.Parse(date);
                equipment.Assignment.RequestedById = User.Identity.Name;
                equipment.Assignment.RequestedByName = User.GetNameClaim();
                await _eventService.TrackEquipmentAssignmentUpdated(equipment);
            }
            else
            {
                equipment.Assignment = new EquipmentAssignment { PersonId = personId, ExpiresAt = DateTime.Parse(date) };
                equipment.Assignment.Person = await _context.People.SingleAsync(p => p.Id == personId);
                equipment.Assignment.RequestedById = User.Identity.Name;
                equipment.Assignment.RequestedByName = User.GetNameClaim();

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

            eq.Attributes.Clear();
            updatedEquipment.Attributes.ForEach(x => eq.AddAttribute(x.Key, x.Value));

            if (updatedEquipment.Space == null)
            {
                eq.Space = null;
            }
            else
            {
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
                    updatedEquipment.ProtectionLevel = "P1";
                }

                if (string.IsNullOrWhiteSpace(updatedEquipment.AvailabilityLevel))
                {
                    updatedEquipment.AvailabilityLevel = "A1";
                }
            }

            if (!EquipmentTypes.BigfixTypes.Contains(updatedEquipment.Type, StringComparer.OrdinalIgnoreCase))
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
            if (equipment == null)
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

            if (equipment == null)
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
        public async Task<IActionResult> GetComputersBySearch(string field, string value)
        {
            if (string.Equals(field, "Name", StringComparison.OrdinalIgnoreCase))
            {
                var results = await this._serviceNowService.GetComputersByName(value);
                if (results.Results.Count == 0)
                {
                    return NotFound();
                }
                else
                {
                    return Json(results);
                }
            } else
            {
                // not supported yet
                return null;
            }
        }
    }
}
