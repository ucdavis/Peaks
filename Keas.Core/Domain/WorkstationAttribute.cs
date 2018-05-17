using Newtonsoft.Json;

namespace Keas.Core.Domain
{
    public class WorkstationAttribute {
        public int Id { get; set; }
        public Workstation Workstation { get; set; }
        public int WorkstationId { get; set; }

        public string Key { get; set; }
        public string Value { get; set; }
    }
}