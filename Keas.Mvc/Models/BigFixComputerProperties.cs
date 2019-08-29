using Bigfix;

namespace Keas.Mvc.Models
{
    public class BigFixComputerProperties {

        public BigFixComputerProperties()
        {
            
        }
        public BigFixComputerProperties(ComputerResult result)
        {
            Id = result.Get(ComputerProperty.Id);
            OS = result.Get(ComputerProperty.OS);
            Name = result.Get(ComputerProperty.Name);
            Locked = result.Get(ComputerProperty.Locked);
            DeviceType = result.Get(ComputerProperty.DeviceType);
            TotalSizeOfSystemDrive = result.Get(ComputerProperty.TotalSizeOfSystemDrive);
            FreeSpaceOnSystemDrive = result.Get(ComputerProperty.FreeSpaceOnSystemDrive);
            SubnetAddress = result.Get(ComputerProperty.SubnetAddress);
            CPU = result.Get(ComputerProperty.CPU);
            DNSName = result.Get(ComputerProperty.DNSName);
            IPAddress = result.Get(ComputerProperty.IPAddress);
            UserName = result.Get(ComputerProperty.UserName);
            RAM = result.Get(ComputerProperty.RAM);
            LastReportTime = result.Get(ComputerProperty.LastReportTime);
        }
        public string Id { get; set; }
        public string OS { get; set; }
        public string Name { get; set; }
        public string Locked { get; set; }
        public string DeviceType { get; set; }
        public string TotalSizeOfSystemDrive { get; set; }
        public string FreeSpaceOnSystemDrive { get; set; }
        public string SubnetAddress { get; set; }
        public string CPU { get; set; }
        public string DNSName { get; set; }
        public string IPAddress { get; set; }
        public string UserName { get; set; }
        public string RAM { get; set; }
        public string LastReportTime { get; set; }
    }
}
