﻿using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text;

namespace Keas.Core.Domain
{
    public class KeyXSpace
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public Key Key { get; set; }
        public int KeyId { get; set; }

        [Required]
        public Space Space { get; set; }
        public int? SpaceId { get; set; }
    }
}
