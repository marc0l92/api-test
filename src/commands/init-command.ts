import { glob } from "glob"

export const initCommand = async (source: string, destinationDir: string) => {
    const files = await glob(source)
    for (const file of files) {
        console.log(file)
    }
}