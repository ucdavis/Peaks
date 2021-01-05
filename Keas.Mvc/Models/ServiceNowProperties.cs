using Newtonsoft.Json;
using System.Collections.Generic;
using System.Text.Json;

namespace Keas.Mvc.Models
{
    public class ServiceNowPropertyWrapper
    {
        [JsonProperty("result")]
        public List<ServiceNowProperties> Result { get; set; }
    }
    public class ServiceNowProperties
    {
        [JsonProperty("hardware_department")]
        public string Department { get; set; }
        [JsonProperty("hardware_model_category")]
        public string ModelCategory { get; set; }
        [JsonProperty("hardware_u_device_name")]
        public string DeviceName { get; set; }
        [JsonProperty("hardware_comments")]
        public string Comments { get; set; }
        [JsonProperty("hardware_u_bigfix_id")]
        public string BigFixId { get; set; }
        [JsonProperty("user_sys_id")]
        public string UserSysId { get; set; }
        [JsonProperty("hardware_serial_number")]
        public string SerialNumber { get; set; }
        [JsonProperty("hardware_u_building")]
        public string Building { get; set; }
        [JsonProperty("hardware_u_data_security_classification")]
        public string SecurityClassification { get; set; }
        [JsonProperty("hardware_support_group")]
        public string SupportGroup { get; set; }
        [JsonProperty("user_sys_domain")]
        public string UserSysDomain { get; set; }
        [JsonProperty("user_sys_class_name")]
        public string UserSysClassName { get; set; }
        [JsonProperty("hardware_u_device_type")]
        public string DeviceType { get; set; }
        [JsonProperty("hardware_u_mac_address")]
        public string MacAddress { get; set; }
        [JsonProperty("user_user_name")]
        public string UserName { get; set; }
        [JsonProperty("hardware_install_status")]
        public string InstallStatus { get; set; }
        [JsonProperty("hardware_sys_id")]
        public string SysId { get; set; }
        [JsonProperty("hardware_sys_class_name")]
        public string SysClassName { get; set; }
        [JsonProperty("hardware_assigned_to")]
        public string AssignedTo { get; set; }
        [JsonProperty("hardware_u_ip_address")]
        public string IpAddress { get; set; }
        [JsonProperty("hardware_quantity")]
        public string Quantity { get; set; }
        [JsonProperty("hardware_u_room")]
        public string Room { get; set; }
        [JsonProperty("hardware_display_name")]
        public string DisplayName { get; set; }
        [JsonProperty("hardware_sys_domain")]
        public string SysDomain { get; set; }
        [JsonProperty("hardware_model")]
        public string Model { get; set; }
    }
}
