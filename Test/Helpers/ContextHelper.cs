using System;
using System.Collections.Generic;
using System.Text;
using Keas.Core.Data;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;

namespace Test.Helpers
{
    public class ContextHelper : IDisposable
    {
        private SqliteConnection Connection { get; }
        public ApplicationDbContext Context { get; }

        public ContextHelper()
        {
            Connection = new SqliteConnection("DataSource=:memory:");
            Connection.Open();

            var options = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseSqlite(Connection)
                .Options;
            Context = new ApplicationDbContext(options);
            Context.Database.EnsureCreated();
        }


        public void Dispose()
        {
            Connection?.Close();
        }
    }
}
