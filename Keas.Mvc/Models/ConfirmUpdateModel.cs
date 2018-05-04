using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Keas.Core.Data;
using Keas.Core.Domain;
using Microsoft.EntityFrameworkCore;

namespace Keas.Mvc.Models
{
    public class ConfirmUpdateModel
    {
        public List<Key> Keys { get; set; }
        public List<Equipment> Equipment { get; set; }


        public static async Task<ConfirmUpdateModel> Create(string teamName, ApplicationDbContext context, User user)
        {
            var viewModel = new ConfirmUpdateModel
            {
                Keys = await context.Keys.Include(k => k.Assignment).Where(k => !k.Assignment.IsConfirmed && k.Assignment.Person.User == user && k.Team.Name == teamName).ToListAsync(),
                Equipment = await context.Equipment.Include(e => e.Assignment).Where(e => !e.Assignment.IsConfirmed && e.Assignment.Person.User == user && e.Team.Name == teamName).ToListAsync()
            };

            return viewModel;
        }
    }
}
