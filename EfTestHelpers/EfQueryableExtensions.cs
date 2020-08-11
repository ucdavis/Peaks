using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Reflection;
using System.Text;
using Microsoft.EntityFrameworkCore.Query;
using Microsoft.EntityFrameworkCore.Query.SqlExpressions;

namespace EfTestHelpers
{
    public static class EfQueryableExtensions
    {
        public static string ToSql<TEntity>(this IQueryable<TEntity> query)
        {
            var version = query.GetEfCoreVersionInfo();

            if (version.ProductMajorPart != 3)
                throw new NotSupportedException($"EF Core version {version.ProductVersion} is not supported");

            if (version.ProductMinorPart == 0)
                return query.ToSqlEf_3_0();

            return query.ToSqlEf_3_1();
        }

        public static string ToSqlEf_3_1<TEntity>(this IQueryable<TEntity> query)
        {
            using var enumerator = query.Provider.Execute<IEnumerable<TEntity>>(query.Expression).GetEnumerator();
            var relationalCommandCache = enumerator.Private("_relationalCommandCache");
            var selectExpression = relationalCommandCache.Private<SelectExpression>("_selectExpression");
            var factory = relationalCommandCache.Private<IQuerySqlGeneratorFactory>("_querySqlGeneratorFactory");

            var sqlGenerator = factory.Create();
            var command = sqlGenerator.GetCommand(selectExpression);

            return command.CommandText;
        }

        public static string ToSqlEf_3_0<TEntity>(this IQueryable<TEntity> query)
        {
            var enumerator = query.Provider.Execute<IEnumerable<TEntity>>(query.Expression).GetEnumerator();
            var enumeratorType = enumerator.GetType();
            var selectFieldInfo = enumeratorType.GetField("_selectExpression", BindingFlags.NonPublic | BindingFlags.Instance)
                                  ?? throw new InvalidOperationException($"cannot find field _selectExpression on type {enumeratorType.Name}");
            var sqlGeneratorFieldInfo = enumeratorType.GetField("_querySqlGeneratorFactory", BindingFlags.NonPublic | BindingFlags.Instance)
                                        ?? throw new InvalidOperationException($"cannot find field _querySqlGeneratorFactory on type {enumeratorType.Name}");
            var selectExpression = selectFieldInfo.GetValue(enumerator) as SelectExpression
                                   ?? throw new InvalidOperationException($"could not get SelectExpression");
            var factory = sqlGeneratorFieldInfo.GetValue(enumerator) as IQuerySqlGeneratorFactory
                          ?? throw new InvalidOperationException($"could not get IQuerySqlGeneratorFactory");
            var sqlGenerator = factory.Create();
            var command = sqlGenerator.GetCommand(selectExpression);
            return command.CommandText;
        }

        public static FileVersionInfo GetEfCoreVersionInfo(this IQueryable query)
        {
            var versionInfo = FileVersionInfo.GetVersionInfo(query.Provider.GetType().Assembly.Location);

            if (versionInfo.ProductName != "Microsoft Entity Framework Core")
                throw new NotSupportedException($"Query provider \"{versionInfo.ProductName}\" is not supported.");

            return versionInfo;
        }

        private static object Private(this object obj, string privateField) => obj?.GetType().GetField(privateField, BindingFlags.Instance | BindingFlags.NonPublic)?.GetValue(obj);
        private static T Private<T>(this object obj, string privateField) => (T)obj?.GetType().GetField(privateField, BindingFlags.Instance | BindingFlags.NonPublic)?.GetValue(obj);
    }
}
