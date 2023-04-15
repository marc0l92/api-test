import { parseCliOptions } from "./cli"

const argv = parseCliOptions(process.argv)

console.log(argv)