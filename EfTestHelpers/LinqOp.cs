using System;
using System.Collections.Generic;
using System.Linq.Expressions;
using System.Reflection;
using System.Text;

namespace EfTestHelpers
{
    /// <summary>
    /// Similulates methodof() and related operators displayed in decompilers such as Reflector, ILSpy and dnSpy
    /// </summary>
    public static class LinqOp
    {
        public static MethodInfo MethodOf<T>(Expression<Func<T>> expression)
        {
            var body = (MethodCallExpression)expression.Body;
            return body.Method;
        }

        public static MethodInfo MethodOf(Expression<Action> expression)
        {
            var body = (MethodCallExpression)expression.Body;
            return body.Method;
        }

        public static ConstructorInfo ConstructorOf<T>(Expression<Func<T>> expression)
        {
            var body = (NewExpression)expression.Body;
            return body.Constructor;
        }

        public static PropertyInfo PropertyOf<T>(Expression<Func<T>> expression)
        {
            var body = (MemberExpression)expression.Body;
            return (PropertyInfo)body.Member;
        }

        public static FieldInfo FieldOf<T>(Expression<Func<T>> expression)
        {
            var body = (MemberExpression)expression.Body;
            return (FieldInfo)body.Member;
        }
    }

}
