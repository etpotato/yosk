import { uniqueNamesGenerator, Config, starWars } from 'unique-names-generator'

const config: Config = {
  dictionaries: [starWars],
}

export const createName = () => uniqueNamesGenerator(config)
