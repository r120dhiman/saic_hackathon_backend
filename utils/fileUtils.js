import fs from "fs/promises"
import path from "path"

export async function ensureDirectoryExists(dirPath) {
  try {
    await fs.access(dirPath)
  } catch (error) {
    if (error.code === "ENOENT") {
      await fs.mkdir(dirPath, { recursive: true })
    } else {
      throw error
    }
  }
}

export async function cleanupOldFiles(directory, maxAgeHours = 24) {
  try {
    const files = await fs.readdir(directory)
    const now = Date.now()
    const maxAge = maxAgeHours * 60 * 60 * 1000

    for (const file of files) {
      const filePath = path.join(directory, file)
      const stats = await fs.stat(filePath)

      if (now - stats.mtime.getTime() > maxAge) {
        await fs.unlink(filePath)
        console.log(`Cleaned up old file: ${file}`)
      }
    }
  } catch (error) {
    console.error("Error cleaning up old files:", error)
  }
}
