﻿using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text;

namespace Keas.Core.Domain
{
    public class KeySerial
    {

        public KeySerial()
        {
            Active = true;
        }

        [Key]
        public int Id { get; set; }

        public Key Key { get; set; }
        public int KeyId { get; set; }

        public string Number { get; set; }

        public KeySerialAssignment Assignment { get; set; }

        public int? KeySerialAssignmentId { get; set; }

        public bool Active { get; set; }
    }
}
