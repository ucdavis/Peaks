using System;
using System.Collections.Generic;
using System.Text;
using Keas.Core.Models;
using Shouldly;
using Xunit;

namespace Test.TestsModel
{
    [Trait("Category", "ModelTests")]
    public class EquipmentTypesTests
    {
        [Fact]
        public void EquipmentTypesListContainsExpectedNumberOfValues()
        {
            EquipmentTypes.Types.Count.ShouldBe(8);
        }

        //1
        [Fact]
        public void EquipmentTypesContainsDefault()
        {
            EquipmentTypes.Default.ShouldBe("Default");
            EquipmentTypes.Types.ShouldContain(EquipmentTypes.Default);
        }

        //2
        [Fact]
        public void EquipmentTypesContainsCard()
        {
            EquipmentTypes.Card.ShouldBe("Card");
            EquipmentTypes.Types.ShouldContain(EquipmentTypes.Card);
        }

        //3
        [Fact]
        public void EquipmentTypesContainsComputer()
        {
            EquipmentTypes.Computer.ShouldBe("Computer");
            EquipmentTypes.Types.ShouldContain(EquipmentTypes.Computer);
        }

        //4
        [Fact]
        public void EquipmentTypesContainsDevice()
        {
            EquipmentTypes.Device.ShouldBe("Device");
            EquipmentTypes.Types.ShouldContain(EquipmentTypes.Device);
        }


        //5
        [Fact]
        public void EquipmentTypesContainsIndustrial()
        {
            EquipmentTypes.Industrial.ShouldBe("Industrial");
            EquipmentTypes.Types.ShouldContain(EquipmentTypes.Industrial);
        }

        //6
        [Fact]
        public void EquipmentTypesContainsOther()
        {
            EquipmentTypes.Other.ShouldBe("Other");
            EquipmentTypes.Types.ShouldContain(EquipmentTypes.Other);
        }

         //7
        [Fact]
        public void EquipmentTypesContainsLaptop()
        {
            EquipmentTypes.Laptop.ShouldBe("Laptop");
            EquipmentTypes.Types.ShouldContain(EquipmentTypes.Laptop);
        }

         //8
        [Fact]
        public void EquipmentTypesContainsCellphone()
        {
            EquipmentTypes.Cellphone.ShouldBe("Cellphone");
            EquipmentTypes.Types.ShouldContain(EquipmentTypes.Cellphone);
        }


    }
}
