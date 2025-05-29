import "server-only"

const dictionaries = {
  nl: () => import("./dictionaries/nl.json").then((module) => module.default),
  en: () => import("./dictionaries/en.json").then((module) => module.default),
}

export const getDictionary = async (locale: "nl" | "en" = "nl") => {
  return dictionaries[locale]()
}
