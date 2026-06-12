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
    },
    counts: {
      mapGroups: 34,
    },
    structureSizes: {
      mapHeader: 0x1c,
      mapLayout: 0x18,
      mapEvents: 0x14,
      regionMapEntry: 0x08,
    },
    limits: {
      maxMapWidth: 512,
      maxMapHeight: 512,
      maxFallbackMapsPerGroup: 512,
    },
  })
}
