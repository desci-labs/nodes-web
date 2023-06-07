export type License = {
  id: number;
  name: string;
  shortName: string;
  spdx: string;
  description: string;
};

export const PDF_LICENSE_TYPES: Array<License> = [
  {
    id: 1,
    name: "CC BY",
    shortName: "CC BY",
    spdx: "CC-BY-4.0",
    description:
      "This license lets others distribute, remix, adapt, and build upon your work, even commercially, as long as they credit you for the original creation.",
  },
  {
    id: 2,
    name: "CC BY-SA",
    shortName: "CC BY-SA",
    spdx: "CC-BY-SA-4.0",
    description:
      "This license lets others remix, adapt, and build upon your work even for commercial purposes, as long as they credit you and license their new creations under the identical terms.",
  },
  {
    id: 0,
    name: "CC0",
    shortName: "CC0",
    spdx: "CC0-1.0",
    description:
      "This license is the most permissive license available. It allows reuse of the software for any purpose, including commercial purposes, and allows the software to be modified and redistributed without restriction.",
  },
  {
    id: 3,
    name: "CC BY-NC",
    shortName: "CC BY-NC",
    spdx: "CC-BY-NC-4.0",
    description:
      "This license lets others remix, adapt, and build upon your work non-commercially, and although their new works must also acknowledge you and be non-commercial, they don't have to license their derivative works on the same terms.",
  },
  {
    id: 4,
    name: "CC BY-NC-SA",
    shortName: "CC BY-NC-SA",
    spdx: "CC-BY-NC-SA-4.0",
    description:
      "This license lets others remix, adapt, and build upon your work non-commercially, as long as they credit you and license their new creations under the identical terms.",
  },
  {
    id: 5,
    name: "CC BY-ND",
    shortName: "CC BY-ND",
    spdx: "CC-BY-ND-4.0",
    description:
      "This license allows for redistribution, commercial and non-commercial, as long as it is passed along unchanged and in whole, with credit to you.",
  },
  {
    id: 6,
    name: "CC BY-NC-ND",
    shortName: "CC BY-NC-ND",
    spdx: "CC-BY-NC-ND-4.0",
    description:
      "This license is the most restrictive of our six main licenses, only allowing others to download your works and share them with others as long as they credit you, but they can't change them in any way or use them commercially.",
  },
];

export const CODE_LICENSE_TYPES: Array<License> = [
  {
    id: 10,
    name: "MIT License",
    shortName: "MIT",
    spdx: "MIT",
    description: "A permissive license that is short and to the point.",
  },
  {
    id: 1,
    name: "Apache License 2.0",
    shortName: "Apache 2.0",
    spdx: "Apache-2.0",
    description:
      "Allows users to use the software for any purpose, to distribute it, to modify it, and to distribute modified versions of the software under the terms of the license, without concern for royalties.",
  },
  {
    id: 11,
    name: "Mozilla Public License 2.0",
    shortName: "MPL 2.0",
    spdx: "MPL-2.0",
    description: "A copyleft license that is easy to comply with.",
  },
  {
    id: 7,
    name: "GNU General Public License v2.0",
    shortName: "GPL 2.0",
    spdx: "GPL-2.0",
    description:
      "A copyleft license that requires you to release your source when you modify the software.",
  },
  {
    id: 8,
    name: "GNU General Public License v3.0",
    shortName: "GPL 3.0",
    spdx: "GPL-3.0",
    description:
      "A copyleft license that requires you to release your source when you modify the software.",
  },
  {
    id: 9,
    name: "GNU Lesser General Public License v2.1",
    shortName: "LGPL 2.1",
    spdx: "LGPL-2.1",
    description:
      "A copyleft license that allows you to link to the libraries without having to release your source code.",
  },

  {
    id: 5,
    name: "Creative Commons Zero v1.0 Universal",
    shortName: "CC0",
    spdx: "CC0-1.0",
    description:
      "This license is the most permissive license available. It allows reuse of the software for any purpose, including commercial purposes, and allows the software to be modified and redistributed without restriction.",
  },
  {
    id: 2,
    name: 'BSD 2-Clause "Simplified" License',
    shortName: "BSD 2-Clause",
    spdx: "BSD-2-Clause",
    description:
      "A permissive license that also provides an express grant of patent rights from contributors to users.",
  },
  {
    id: 3,
    name: 'BSD 3-Clause "New" or "Revised" License',
    shortName: "BSD 3-Clause",
    spdx: "BSD-3-Clause",
    description:
      "A permissive license similar to the BSD 2-Clause License, but with a 3rd clause that prohibits others from using the name of the project or its contributors to promote derived products without written consent.",
  },
  {
    id: 0,
    name: "GNU Affero General Public License v3.0",
    shortName: "AGPL 3.0",
    spdx: "AGPL-3.0",
    description:
      "A copyleft license that requires you to release your source when you modify the software.",
  },
  {
    id: 4,
    name: "Boost Software License 1.0",
    shortName: "BSL 1.0",
    spdx: "BSL-1.0",
    description: "A permissive license that is short and to the point.",
  },

  {
    id: 6,
    name: "Eclipse Public License 2.0",
    shortName: "EPL 2.0",
    spdx: "EPL-2.0",
    description: "A copyleft license that is easy to comply with.",
  },

  {
    id: 12,
    name: "The Unlicense",
    shortName: "Unlicense",
    spdx: "Unlicense",
    description: "A permissive license that is short and to the point.",
  },
];
