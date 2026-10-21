# SQL project disposition

The production capture is the baseline authority. SQL-project definitions were retained through the versioned baseline or replaced as listed below. Git history retains the original files. No maintenance script runs automatically.

| Original file | Replacement | Original SHA-256 |
|---|---|---|
| `Keas.Sql/Compare/ProjectToSqlExpress.scmp` | `Keas.DbTool capture / verify` | `f54938282312a4924c0dca387756c7d422349ec86e60e53da038f43b2e76508e` |
| `Keas.Sql/Compare/ProjectToTestDb.scmp` | `Keas.DbTool capture / verify` | `4f82392989c6a7d6431b2539925c36b1a1f4569900214eca9df64ec09865fc85` |
| `Keas.Sql/Keas.Sql.sqlproj` | `Keas.Core migrations; Keas.DbTool solution entry` | `5ed48260c0bf5ed0b5d4131769b1910366bfe49d0d894f12f086b92ff83b1732` |
| `Keas.Sql/Scripts/PopulateIs3Fields.sql` | `docs/database/maintenance/PopulateIs3Fields.sql` | `ab560339d1a2ccdcd347b0ef331f6aa306ea7f5022cbf46b8704074359ad6397` |
| `Keas.Sql/dbo/Stored Procedures/usp_MergeSpacesTable.sql` | `Keas.Core/Migrations/Sql/ProductionBaseline/usp_MergeSpacesTable.sql` | `def30fc1dbbd4f2a82cbfec0203fd61567227346e1704a5b4ad71a347dbe12ca` |
| `Keas.Sql/dbo/Stored Procedures/usp_TruncateAndReloadLoadingSpaces.sql` | `Keas.Core/Migrations/Sql/ProductionBaseline/usp_TruncateAndReloadLoadingSpaces.sql` | `1f2fa165013ff131870ee130f7c9bc0205f5447a1a72e0e73d3fd3ab38429130` |
| `Keas.Sql/dbo/Tables/Access.sql` | `Keas.Core/Migrations/Sql/ProductionBaseline/Tables.sql` | `ef9ec4bddc578bbf501d2109d1e7091e728ca1b7da3d3dc1c3ac4511593bf6cc` |
| `Keas.Sql/dbo/Tables/AccessAssignments.sql` | `Keas.Core/Migrations/Sql/ProductionBaseline/Tables.sql` | `11f2748ffd919755d5f37d24782bea7b5e2100578dfa1dd9bdcf0afd1adc81c7` |
| `Keas.Sql/dbo/Tables/Bldg.sql` | `Keas.Core/Migrations/Sql/ProductionBaseline/Tables.sql` | `3fd57401f56522e4f0182929c5f5887b625ac738192c5876bfd3328a457b18eb` |
| `Keas.Sql/dbo/Tables/BldgName.sql` | `Keas.Core/Migrations/Sql/ProductionBaseline/Tables.sql` | `5c0b201d544a75d879cdd03fd160a85df18442b3cb6858940ebbee94cb9ea053` |
| `Keas.Sql/dbo/Tables/Dept.sql` | `Keas.Core/Migrations/Sql/ProductionBaseline/Tables.sql` | `dd8d4fb01337787a503cd67e1beac1cb5b5b9c56eef5bf12471098d5cedf0882` |
| `Keas.Sql/dbo/Tables/DeptBldg.sql` | `Keas.Core/Migrations/Sql/ProductionBaseline/Tables.sql` | `e0f7be6d9d29eabb5d1860b4d7b9608f20f815cd3f194fbae8ee449bd745927b` |
| `Keas.Sql/dbo/Tables/DeptName.sql` | `Keas.Core/Migrations/Sql/ProductionBaseline/Tables.sql` | `9f273f0f7a8aa7af2a6cec350ed24b1648021165dbd27ec71b343f69fdf4ae4f` |
| `Keas.Sql/dbo/Tables/DeptSpace.sql` | `Keas.Core/Migrations/Sql/ProductionBaseline/Tables.sql` | `6a82a7323f56d8524b1f1d559f1e1a7dc2b91a44e811c4c227caf0456af0146a` |
| `Keas.Sql/dbo/Tables/Documents.sql` | `Keas.Core/Migrations/Sql/ProductionBaseline/Tables.sql` | `34163a54db754f8f65942e7d6e58541764acd1ad3fe042e9eee0373adfc9e4c4` |
| `Keas.Sql/dbo/Tables/Equipment.sql` | `Keas.Core/Migrations/Sql/ProductionBaseline/Tables.sql` | `2312fe44e8b6d061e58ffaf4f7f296281d8d3868937d3c0e8d04cac742a21cd9` |
| `Keas.Sql/dbo/Tables/EquipmentAssignments.sql` | `Keas.Core/Migrations/Sql/ProductionBaseline/Tables.sql` | `fab39f6ae8963069285e58d56efd75f4580b93fe813c5c84eada994484dd226d` |
| `Keas.Sql/dbo/Tables/EquipmentAttributeKeys.sql` | `Keas.Core/Migrations/Sql/ProductionBaseline/Tables.sql` | `75ea3f01a2b3c43ed42075cf33c1dc6cf0764d783b2d32325cefeef71318c599` |
| `Keas.Sql/dbo/Tables/EquipmentAttributes.sql` | `Keas.Core/Migrations/Sql/ProductionBaseline/Tables.sql` | `2f71a88df816fdd851e1a6b66f847d80774e5e732fac0cecaccf17e59ee61897` |
| `Keas.Sql/dbo/Tables/FISOrgs.sql` | `Keas.Core/Migrations/Sql/ProductionBaseline/Tables.sql` | `e0ec08a4ff4f2bba886d7703eeef96a77b8a6a59a06af35cf8b787c8bd1348d5` |
| `Keas.Sql/dbo/Tables/Floor.sql` | `Keas.Core/Migrations/Sql/ProductionBaseline/Tables.sql` | `75b155127c36fdf004461c94b04ff66436a7ab6ba5ca69ed9a7972218b6ece3c` |
| `Keas.Sql/dbo/Tables/GroupPermissions.sql` | `Keas.Core/Migrations/Sql/ProductionBaseline/Tables.sql` | `f0c6c9cbf39cc986d5d4bb17beab47b67cdb46f3423b51e840ebc7340209e8d1` |
| `Keas.Sql/dbo/Tables/GroupXTeams.sql` | `Keas.Core/Migrations/Sql/ProductionBaseline/Tables.sql` | `2ba856eb8e3bea72a7fd26f458624d0fd5c5b6ce040e795b1b3949b3a53ad8a5` |
| `Keas.Sql/dbo/Tables/Groups.sql` | `Keas.Core/Migrations/Sql/ProductionBaseline/Tables.sql` | `0ca0b1baaae6f100f2eb8b89adf4edb2787807b4ac2117d3a421e1d97d1aaacd` |
| `Keas.Sql/dbo/Tables/Histories.sql` | `Keas.Core/Migrations/Sql/ProductionBaseline/Tables.sql` | `67f9ff719d4261e3b06069c9961140dbf20ba3db8c66a39eba0fed8549361b46` |
| `Keas.Sql/dbo/Tables/KeySerialAssignments.sql` | `Keas.Core/Migrations/Sql/ProductionBaseline/Tables.sql` | `7bf5c424759979fd96e38eeb9ecb48d2b869a641b980cd46ceb3f20598b50ff3` |
| `Keas.Sql/dbo/Tables/KeySerials.sql` | `Keas.Core/Migrations/Sql/ProductionBaseline/Tables.sql` | `f357fdddf2bad37047ae62323b63aca40e166fe34572d4e62ee6d3d8e6c8af4f` |
| `Keas.Sql/dbo/Tables/KeyXSpaces.sql` | `Keas.Core/Migrations/Sql/ProductionBaseline/Tables.sql` | `8bf73932fe20599599098a06303aecdc40b148de5ae719ccca22ddcb5284dab2` |
| `Keas.Sql/dbo/Tables/Keys.sql` | `Keas.Core/Migrations/Sql/ProductionBaseline/Tables.sql` | `b852819f5e9a56bc6d019a5e8ccb23221d9a77fd8db0358d2b7f1d5c949aee73` |
| `Keas.Sql/dbo/Tables/LoadingSpaces.sql` | `Keas.Core/Migrations/Sql/ProductionBaseline/Tables.sql` | `f3df3477a5290ac014f18147af14224956bb192ade0e57611e3124056a4c21a7` |
| `Keas.Sql/dbo/Tables/Notifications.sql` | `Keas.Core/Migrations/Sql/ProductionBaseline/Tables.sql` | `e3387733b02ea6a156c922deb51428906ccf62556d180fd5b755db301d33a956` |
| `Keas.Sql/dbo/Tables/People.sql` | `Keas.Core/Migrations/Sql/ProductionBaseline/Tables.sql` | `fca6a53bd97322c6c3f6ae8d11eb14323635d1656fcbf793daec93a9232fbc6d` |
| `Keas.Sql/dbo/Tables/PersonNotifications.sql` | `Keas.Core/Migrations/Sql/ProductionBaseline/Tables.sql` | `58176833e1302a5d8490ccab1a7c7364428ae9014a905a31c4dc6656c059d96f` |
| `Keas.Sql/dbo/Tables/Roles.sql` | `Keas.Core/Migrations/Sql/ProductionBaseline/Tables.sql` | `6259b0c5e742718822ddd11e0a5cda609f664d1fa9d7d3bd193a7e7b12fd389b` |
| `Keas.Sql/dbo/Tables/Room.sql` | `Keas.Core/Migrations/Sql/ProductionBaseline/Tables.sql` | `c0ca4f2279c58f0bcad783a8505c46f91a0bc4a2872b13dc64ddbeef4416be75` |
| `Keas.Sql/dbo/Tables/Spaces.sql` | `Keas.Core/Migrations/Sql/ProductionBaseline/Tables.sql` | `8f82ee38d505b772a47461aa672de33a804933f84552140c61221b2de0f89430` |
| `Keas.Sql/dbo/Tables/SystemPermissions.sql` | `Keas.Core/Migrations/Sql/ProductionBaseline/Tables.sql` | `fc55de08a8dcf3aeb0c130f132b769887d2b13371e7b2d69bd598c9bd9043576` |
| `Keas.Sql/dbo/Tables/Tags.sql` | `Keas.Core/Migrations/Sql/ProductionBaseline/Tables.sql` | `f95cb79d52d03e607f1070960b85422c96549771108eadce35bf69c982eae6d4` |
| `Keas.Sql/dbo/Tables/TeamApiCodes.sql` | `Keas.Core/Migrations/Sql/ProductionBaseline/Tables.sql` | `426dce5cf119619665e0ff4d53ac07952097c5db4026a92a88840c0af860a6ae` |
| `Keas.Sql/dbo/Tables/TeamDocumentSettings.sql` | `Keas.Core/Migrations/Sql/ProductionBaseline/Tables.sql` | `8cb3ae7fe84a6b0d77028c974073040b386780346836f1483f0d0fabdde73829` |
| `Keas.Sql/dbo/Tables/TeamPermissions.sql` | `Keas.Core/Migrations/Sql/ProductionBaseline/Tables.sql` | `e0018b43b7b07728ae069f63f9e1a5e26a30c8db6e129de8d7df8b9a5d481c00` |
| `Keas.Sql/dbo/Tables/TeamPpsDepartments.sql` | `Keas.Core/Migrations/Sql/ProductionBaseline/Tables.sql` | `1ce11a89fd503b43a06916827f1629c190d5d485f1b7d5727c6efa337ebefd36` |
| `Keas.Sql/dbo/Tables/Teams.sql` | `Keas.Core/Migrations/Sql/ProductionBaseline/Tables.sql` | `d26adb1c3cd68883534c19d0fe30911e05769adade3af26ea03f48c800b28def` |
| `Keas.Sql/dbo/Tables/Users.sql` | `Keas.Core/Migrations/Sql/ProductionBaseline/Tables.sql` | `e153a6a0489b8b74611df0ab3847d104df18db04b9686b0e975419da6239bc16` |
| `Keas.Sql/dbo/Tables/WorkstationAssignments.sql` | `Keas.Core/Migrations/Sql/ProductionBaseline/Tables.sql` | `9d31dd70058c8ee3e82a9eae8a7e67b238be9a525d8e5b40bd8a80babfb55195` |
| `Keas.Sql/dbo/Tables/WorkstationAttributes.sql` | `Keas.Core/Migrations/Sql/ProductionBaseline/Tables.sql` | `8771bdcca4ef6f985a8ff07b35b2b0e4d0a1b116302bb0cc0da6eec068f7bf10` |
| `Keas.Sql/dbo/Tables/Workstations.sql` | `Keas.Core/Migrations/Sql/ProductionBaseline/Tables.sql` | `9181a0a9463f9f9573b69f6923933e079eff970c93d9639615846cf17f620f0e` |
| `Keas.Sql/dbo/Views/vExtendedPersonViews.sql` | `Keas.Core/Migrations/Sql/ProductionBaseline/vExtendedPersonViews.sql` | `5046d3fc089c440aa0bff746bd52050739d44093dabb856b342167b6e5050f3b` |
| `Keas.Sql/dbo/Views/vRooms.sql` | `Keas.Core/Migrations/Sql/ProductionBaseline/vRooms.sql` | `c83b93d88204d37d15f3ff74fc104848fe1369b031f5aea69c0d9855bf518755` |
| `Keas.Sql/dbo/Views/vSpaceRooms.sql` | `Keas.Core/Migrations/Sql/ProductionBaseline/vSpaceRooms.sql` | `338479e35e29e6a88402343bcd1dfdb11fb316c2ee0e81f337c6c5997e579c8a` |
| `Keas.Sql/dbo/Views/vSpaces.sql` | `Keas.Core/Migrations/Sql/ProductionBaseline/vSpaces.sql` | `d3fd9a9c986428a604a06fe822b487cc216c6d99364d6b5e832d921b45a1c721` |
