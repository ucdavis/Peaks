using System;
using System.Collections.Generic;
using System.Text;
using Keas.Core.Models;
using Newtonsoft.Json.Converters;
using Shouldly;
using Xunit;

namespace Test.TestsModel
{
    [Trait("Category", "ModelTests")]
    public class EquipmentTypesTests
    {

        #region Types List
        [Fact]
        public void EquipmentTypesListContainsExpectedNumberOfValues()
        {
            EquipmentTypes.Types.Count.ShouldBe(14);
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

        //9
        [Fact]
        public void EquipmentTypesContainsSoftware()
        {
            EquipmentTypes.Software.ShouldBe("Software");
            EquipmentTypes.Types.ShouldContain(EquipmentTypes.Software);
        }

        //10
        [Fact]
        public void EquipmentTypesContainsDesktop()
        {
            EquipmentTypes.Desktop.ShouldBe("Desktop");
            EquipmentTypes.Types.ShouldContain(EquipmentTypes.Desktop);
        }

        //11
        [Fact]
        public void EquipmentTypesContainsServer()
        {
            EquipmentTypes.Server.ShouldBe("Server");
            EquipmentTypes.Types.ShouldContain(EquipmentTypes.Server);
        }

        //12
        [Fact]
        public void EquipmentTypesContainsTablet()
        {
            EquipmentTypes.Tablet.ShouldBe("Tablet");
            EquipmentTypes.Types.ShouldContain(EquipmentTypes.Tablet);
        }

        //13
        [Fact]
        public void EquipmentTypesContainsPrinter()
        {
            EquipmentTypes.Printer.ShouldBe("Printer");
            EquipmentTypes.Types.ShouldContain(EquipmentTypes.Printer);
        }

        //14
        [Fact]
        public void EquipmentTypesContainsAccessory()
        {
            EquipmentTypes.Accessory.ShouldBe("Accessory");
            EquipmentTypes.Types.ShouldContain(EquipmentTypes.Accessory);
        }

        #endregion Types List

        #region MakeAndModelTypes List

        [Fact]
        public void EquipmentMakeAndModelTypesListContainsExpectedNumberOfValues()
        {
            EquipmentTypes.MakeAndModelTypes.Count.ShouldBe(12);
        }

        //1
        [Fact]
        public void EquipmentMakeAndModelTypesContainsDefault()
        {
            EquipmentTypes.Default.ShouldBe("Default");
            EquipmentTypes.MakeAndModelTypes.ShouldContain(EquipmentTypes.Default);
        }

        //2
        [Fact]
        public void EquipmentMakeAndModelTypesContainsComputer()
        {
            EquipmentTypes.Computer.ShouldBe("Computer");
            EquipmentTypes.MakeAndModelTypes.ShouldContain(EquipmentTypes.Computer);
        }

        //3
        [Fact]
        public void EquipmentMakeAndModelTypesContainsDevice()
        {
            EquipmentTypes.Device.ShouldBe("Device");
            EquipmentTypes.MakeAndModelTypes.ShouldContain(EquipmentTypes.Device);
        }


        //4
        [Fact]
        public void EquipmentMakeAndModelTypesContainsIndustrial()
        {
            EquipmentTypes.Industrial.ShouldBe("Industrial");
            EquipmentTypes.MakeAndModelTypes.ShouldContain(EquipmentTypes.Industrial);
        }

        //5
        [Fact]
        public void EquipmentMakeAndModelTypesContainsOther()
        {
            EquipmentTypes.Other.ShouldBe("Other");
            EquipmentTypes.MakeAndModelTypes.ShouldContain(EquipmentTypes.Other);
        }

        //6
        [Fact]
        public void EquipmentMakeAndModelTypesContainsLaptop()
        {
            EquipmentTypes.Laptop.ShouldBe("Laptop");
            EquipmentTypes.MakeAndModelTypes.ShouldContain(EquipmentTypes.Laptop);
        }

        //7
        [Fact]
        public void EquipmentMakeAndModelTypesContainsCellphone()
        {
            EquipmentTypes.Cellphone.ShouldBe("Cellphone");
            EquipmentTypes.MakeAndModelTypes.ShouldContain(EquipmentTypes.Cellphone);
        }

        //8
        [Fact]
        public void EquipmentMakeAndModelTypesContainsDesktop()
        {
            EquipmentTypes.Desktop.ShouldBe("Desktop");
            EquipmentTypes.MakeAndModelTypes.ShouldContain(EquipmentTypes.Desktop);
        }

        //9
        [Fact]
        public void EquipmentMakeAndModelTypesContainsServer()
        {
            EquipmentTypes.Server.ShouldBe("Server");
            EquipmentTypes.MakeAndModelTypes.ShouldContain(EquipmentTypes.Server);
        }

        //10
        [Fact]
        public void EquipmentMakeAndModelTypesContainsTablet()
        {
            EquipmentTypes.Tablet.ShouldBe("Tablet");
            EquipmentTypes.MakeAndModelTypes.ShouldContain(EquipmentTypes.Tablet);
        }

        //11
        [Fact]
        public void EquipmentMakeAndModelTypesContainsPrinter()
        {
            EquipmentTypes.Printer.ShouldBe("Printer");
            EquipmentTypes.MakeAndModelTypes.ShouldContain(EquipmentTypes.Printer);
        }

        //12
        [Fact]
        public void EquipmentMakeAndModelTypesContainsAccessory()
        {
            EquipmentTypes.Accessory.ShouldBe("Accessory");
            EquipmentTypes.MakeAndModelTypes.ShouldContain(EquipmentTypes.Accessory);
        }


        #endregion

        #region Is3Types List

        [Fact]
        public void Is3TypesListContainsExpectedNumberOfValues()
        {
            EquipmentTypes.Is3Types.Count.ShouldBe(7);
        }

        //1
        [Fact]
        public void Is3TypesContainsComputer()
        {
            EquipmentTypes.Computer.ShouldBe("Computer");
            EquipmentTypes.Is3Types.ShouldContain(EquipmentTypes.Computer);
        }
        //2
        [Fact]
        public void Is3TypesContainsDesktop()
        {
            EquipmentTypes.Desktop.ShouldBe("Desktop");
            EquipmentTypes.Is3Types.ShouldContain(EquipmentTypes.Desktop);
        }
        //3
        [Fact]
        public void Is3TypesContainsLaptop()
        {
            EquipmentTypes.Laptop.ShouldBe("Laptop");
            EquipmentTypes.Is3Types.ShouldContain(EquipmentTypes.Laptop);
        }
        //4
        [Fact]
        public void Is3TypesContainsServer()
        {
            EquipmentTypes.Server.ShouldBe("Server");
            EquipmentTypes.Is3Types.ShouldContain(EquipmentTypes.Server);
        }
        //5
        [Fact]
        public void Is3TypesContainsCellphone()
        {
            EquipmentTypes.Cellphone.ShouldBe("Cellphone");
            EquipmentTypes.Is3Types.ShouldContain(EquipmentTypes.Cellphone);
        }
        //6
        [Fact]
        public void Is3TypesContainsDevice()
        {
            EquipmentTypes.Device.ShouldBe("Device");
            EquipmentTypes.Is3Types.ShouldContain(EquipmentTypes.Device);
        }
        //7
        [Fact]
        public void Is3TypesContainsTablet()
        {
            EquipmentTypes.Tablet.ShouldBe("Tablet");
            EquipmentTypes.Is3Types.ShouldContain(EquipmentTypes.Tablet);
        }


        #endregion

        #region ManagedSystemTypes List

        [Fact]
        public void ManagedSystemTypesListContainsExpectedNumberOfValues()
        {
            EquipmentTypes.ManagedSystemTypes.Count.ShouldBe(4);
        }

        //1
        [Fact]
        public void ManagedSystemTypesContainsComputer()
        {
            EquipmentTypes.Computer.ShouldBe("Computer");
            EquipmentTypes.Is3Types.ShouldContain(EquipmentTypes.Computer);
        }
        //2
        [Fact]
        public void ManagedSystemTypesContainsServer()
        {
            EquipmentTypes.Server.ShouldBe("Server");
            EquipmentTypes.Is3Types.ShouldContain(EquipmentTypes.Server);
        }
        //3
        [Fact]
        public void ManagedSystemTypesContainsDesktop()
        {
            EquipmentTypes.Desktop.ShouldBe("Desktop");
            EquipmentTypes.Is3Types.ShouldContain(EquipmentTypes.Desktop);
        }
        //4
        [Fact]
        public void ManagedSystemTypesContainsLaptop()
        {
            EquipmentTypes.Laptop.ShouldBe("Laptop");
            EquipmentTypes.Is3Types.ShouldContain(EquipmentTypes.Laptop);
        }

        #endregion
    }
}
