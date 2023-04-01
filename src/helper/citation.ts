import {
  ResearchObjectComponentType,
  ResearchObjectV1,
} from "@desci-labs/desci-models";
import { DriveNonComponentTypes } from "@src/components/organisms/DriveFilePicker";

export type CitationFormats = "BibTex" | "Datacite" | "APA" | "MLA";

export const CITATION_FORMATS: { id: number; name: CitationFormats }[] = [
  { id: 0, name: "BibTex" },
  { id: 1, name: "Datacite" },
  { id: 2, name: "APA" },
  { id: 3, name: "MLA" },
];

export type CitationFormat = typeof CITATION_FORMATS[number]["name"];

const formatNames = (names: string[]) => {
  const sunameInitial: Record<string, string[]> = {};
  const parsed =
    names.length > 0
      ? names.map((name) => {
          let params = name.split(" ");
          let surname =
            params[0]
              .substring(0, 1)
              .toUpperCase()
              .concat(params[0].substring(1)) ?? "";
          let firstName = params[1] ?? "";
          let initials =
            params.length > 1
              ? params
                  .slice(1)
                  .map((namePart) => namePart[0].toUpperCase())
                  .join(".")
              : "";

          let key = `${surname.toLowerCase()}${initials.toLowerCase()}`;

          sunameInitial[key] = sunameInitial[key]
            ? sunameInitial[key].concat([firstName])
            : [firstName];
          return `${surname}${initials ? ", " + initials : ""}`;
        })
      : [];

  if (parsed.length === 1) {
    return parsed[0] + ".";
  }

  let results = [];
  const handledKeys: string[] = [];
  for (let i = 0; i < parsed.length; i++) {
    let name = parsed[i];
    let key = name.replaceAll(/[,|\t\s]/gi, "").toLowerCase();
    let entry = sunameInitial[key];
    console.log("key", key, name, entry, handledKeys);

    if (handledKeys.includes(key)) continue;

    if (entry && entry.length > 1) {
      handledKeys.push(key);
      const surname = name.split(",")[0];
      const initial = name.split(",")[1].split(".")?.[0].toUpperCase() ?? "";
      const authorNames = `[${sunameInitial[key].join(", ")}]`;
      results.push(`${surname},${initial}.${authorNames}`);
      continue;
    }

    if (i === parsed.length - 1) {
      results.push(`& ${name}`);
    } else {
      results.push(name);
    }
  }

  console.log("Parsed", results.join(", "), names);
  return results.join(", ");
};

export const getFormatter = (format: CitationFormats) => {
  switch (format) {
    case "APA":
      return apaFormatter;
    case "BibTex":
      return bibTexFormatter;
    case "Datacite":
      return defaultFormatter;
    case "MLA":
      return defaultFormatter;
    default:
      return defaultFormatter;
  }
};

export const DEFAULT_RESULT = {
  citation: "",
  authors: "",
  publicationYear: "n.d",
  publisher: "Desci Nodes",
  location: "Amsterdam, Netherlands",
};

type FormatterResult = {
  citation: string;
  authors: string;
  publicationYear: string | number;
  publisher: string;
  location: string;
};

interface FormatterProps {
  author: string;
  manifest: ResearchObjectV1;
  dpidLink: string;
  year?: number;
  componentType?: ResearchObjectComponentType | DriveNonComponentTypes;
  isPublished: boolean;
}

const defaultFormatter = (props: FormatterProps): FormatterResult => {
  const authorNames = formatNames(
    [props.author]
      .concat(props.manifest?.authors?.map((c) => c.name) ?? [])
      .filter(Boolean)
  );
  const year = props?.year
    ? props.year.toString()
    : DEFAULT_RESULT.publicationYear;

  const content = `${authorNames} ${"(" + year + ")."} ${
    props.manifest.title ?? ""
  }${props.dpidLink ? ", " + props.dpidLink : ""}`;

  return {
    ...DEFAULT_RESULT,
    citation: content,
    authors: authorNames,
    publicationYear: year,
  };
};

const apaFormatter = (props: FormatterProps): FormatterResult => {
  let authorNames = formatNames(
    [props.author]
      .concat(props.manifest?.authors?.map((c) => c.name) ?? [])
      .filter(Boolean)
  );

  const year = props?.year
    ? props.year.toString()
    : DEFAULT_RESULT.publicationYear;
  console.log("YRRR", year);
  const content = `${authorNames} ${"(" + year + "):"} ${
    props.manifest.title ?? ""
  }. ${props.dpidLink}`;

  return {
    ...DEFAULT_RESULT,
    citation: content,
    authors: authorNames,
    publicationYear: year,
  };
};

const formatBibTexAuthor = (authors: string[]) => {
  return authors.length > 0
    ? authors
        .map((name) => {
          const parts = name.split(" ");
          if (parts.length === 1) return capitalize(parts[0]);
          const surname = capitalize(parts[0]);
          const middleName = parts[1];
          const lastName = parts[2] ?? middleName;

          return `${capitalize(lastName[0])}. ${surname}`;
        })
        .join(" and ")
    : "";
};

const getBibtexEntryKey = (
  type: ResearchObjectComponentType | DriveNonComponentTypes,
  isPublished: boolean
) => {
  if (!isPublished) return "unpublished";
  if (!type) return "misc";
  switch (type) {
    case ResearchObjectComponentType.PDF:
      return "article";
    case ResearchObjectComponentType.CODE:
    case ResearchObjectComponentType.DATA:
    case ResearchObjectComponentType.LINK:
    case ResearchObjectComponentType.TERMINAL:
    case ResearchObjectComponentType.VIDEO:
      return "misc";
    default:
      return "misc";
  }
};

const bibTexFormatter = (props: FormatterProps): FormatterResult => {
  const authors = formatBibTexAuthor(
    (props.manifest?.authors ?? [])?.map((c) => c.name).filter(Boolean)
  );

  // test cases
  // console.log(
  //   "Bibtext format",
  //   formatBibTexAuthor(["Oloyede Shadrach Temitayo"])
  // );
  // console.log(
  //   "Bibtext format",
  //   formatBibTexAuthor([
  //     "Oloyede Shadrach Temitayo",
  //     "Micheal Angelo",
  //     "Victor Scholes",
  //   ])
  // );
  // console.log(
  //   "Bibtext format",
  //   formatBibTexAuthor([
  //     "Oloyede Shadrach Temitayo",
  //     "Micheal Angelo",
  //     "Micheal Andela",
  //     "Miracle Aparo",
  //   ])
  // );
  // console.log(
  //   "Bibtext format",
  //   formatBibTexAuthor([
  //     "Oloyede Shadrach Temitayo",
  //     "Micheal Angelo",
  //     "Micheal Andela",
  //     "Miracle Aparo",
  //   ])
  // );
  //
  const year = props?.year ? props.year.toString() : "";

  const type = getBibtexEntryKey(props.componentType!, props.isPublished);
  const authorSurname = capitalize(props.author.split(" ")[0] ?? "");
  const citeKey = authorSurname + year;
  const citation = `
  @${type}{${citeKey},
    author    = {${authors}},
    title     = {${props.manifest?.title ?? ""}},
    year      = {${year}},
    url       = {${props.dpidLink}}
  }
  `;

  return { ...DEFAULT_RESULT, citation, authors, publicationYear: year };
};

// const mlaFormatter = (props: {
//   author: string;
//   manifest: ResearchObjectV1;
//   dpidLink: string;
//   year?: number;
// }): FormatterResult => {
//   return DEFAULT_RESULT;
// };
// const dataCiteFormatter = (props: {
//   author: string;
//   manifest: ResearchObjectV1;
//   dpidLink: string;
//   year?: number;
// }): FormatterResult => {
//   return DEFAULT_RESULT;
// };

const capitalize = (text: string) =>
  text.substring(0, 1).toUpperCase() + text.substring(1);
