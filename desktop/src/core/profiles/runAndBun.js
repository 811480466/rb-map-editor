import RomProfile from "../rom/RomProfile"

export const RUN_AND_BUN_PROFILE_ID = "run-and-bun-1.07"

/**
 * @returns {RomProfile}
 */
export function createRunAndBunProfile() {
  return new RomProfile({
    id: RUN_AND_BUN_PROFILE_ID,
    name: "Pokemon Run&Bun",
    version: "1.07",
    addresses: {
      mapGroups: 0x00552ab4,
      regionMapEntries: 0x006a1960,
      multichoiceTable: 0x006859d0,
      multichoiceTablePointerReferences: [
        0x00100d74,
        0x00101250,
      ],
      multichoiceExitText: 0x006efd17,
      moveNameTable: 0x003a4486,
      wildEncounterHeaderPointerReferences: [
        0x000d31d8,
        0x000d39dc,
        0x000d3a34,
        0x000d3adc,
        0x000d3ba8,
        0x000d3cc4,
        0x000d3d24,
        0x000d3d70,
        0x000d3dec,
        0x000d3e30,
        0x000d3eb8,
        0x0016cedc,
        0x0016cf18,
        0x001c8058,
      ],
    },
    counts: {
      mapGroups: 34,
    },
    structureSizes: {
      mapHeader: 0x1c,
      mapLayout: 0x18,
      mapConnections: 0x08,
      mapConnection: 0x0c,
      mapEvents: 0x14,
      regionMapEntry: 0x08,
      wildEncounterHeader: 0x14,
      wildEncounterInfo: 0x08,
      wildPokemon: 0x04,
      multichoiceEntry: 0x08,
      multichoiceItem: 0x08,
      moveName: 0x0d,
    },
    limits: {
      maxMapWidth: 512,
      maxMapHeight: 512,
      maxFallbackMapsPerGroup: 512,
      multichoiceOriginalCount: 0x7f,
      multichoiceExpandedCount: 0x100,
      moveTutorMenuStartId: 0x7f,
      moveTutorMenuSlots: 10,
      moveTutorMenuSkillCapacity: 10,
    },
    freeSpaceStart: 0x01900000,
  })
}
