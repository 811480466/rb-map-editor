export default class RomExportService {
  /**
   * @param {import("../project/RomProject").default | null} project
   * @param {{ fileName?: string }} options
   * @returns {{ fileName: string, blob: Blob, size: number }}
   */
  exportProject(project, options = {}) {
    if (!project?.rom) {
      throw new Error("当前没有已加载的 ROM")
    }

    const fileName = options.fileName || this.createFileName(project.rom.name)

    return {
      fileName,
      blob: project.rom.toBlob(),
      size: project.rom.size,
    }
  }

  /**
   * @param {string} [originalName]
   * @returns {string}
   */
  createFileName(originalName = "") {
    if (!originalName) return "exported-rom.gba"

    const dotIndex = originalName.lastIndexOf(".")
    if (dotIndex <= 0) return `${originalName}-edited.gba`

    return `${originalName.slice(0, dotIndex)}-edited${originalName.slice(dotIndex)}`
  }
}
