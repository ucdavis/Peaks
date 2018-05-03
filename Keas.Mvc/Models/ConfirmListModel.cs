using System.Collections.Generic;
using Keas.Core.Data;
using Keas.Core.Domain;
using System.Linq;
using System.Threading.Tasks;
using Keas.Mvc.Services;
using Microsoft.EntityFrameworkCore;

namespace Keas.Mvc.Models
{
    public class ConfirmListModel
    {
        public List<Key> Keys { get; set; }
        public List<Equipment> Equipment { get; set; }

       
        public static async Task<ConfirmListModel> Create(string teamName, ApplicationDbContext context, User user)
        {
            var viewModel = new ConfirmListModel
            {
                Keys = await context.Keys.Where(k => !k.Assignment.IsConfirmed && k.Assignment.Person.User == user && k.Team.Name == teamName).ToListAsync(),
                Equipment = await context.Equipment.Where(e => !e.Assignment.IsConfirmed && e.Assignment.Person.User == user && e.Team.Name == teamName).ToListAsync()
            };
            
            return viewModel;
        }

    }
}
