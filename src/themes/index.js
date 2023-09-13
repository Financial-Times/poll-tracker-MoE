import { parse } from "yaml";
import themesJSON from "./themes.json";
import { object as dotObject } from "dot-object";

export const themes = themesJSON
  .map(({ definition_yaml: yaml, ...theme }) => {
    const { settings, ...themeParsed } = parse(yaml);

    return {
      ...theme,
      ...themeParsed,
      settings: dotObject(settings),
    };
  })
  .reduce(
    (a, c) => ({
      [c.name]: c,
      ...a,
    }),
    {}
  );
