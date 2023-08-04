import Base64Binary from "@components/../base64binary";
import { Cookies } from "react-cookie";
import { CoinbaseWallet } from "@web3-react/coinbase-wallet";
import { GnosisSafe } from "@web3-react/gnosis-safe";
import { MetaMask } from "@web3-react/metamask";
import { Network } from "@web3-react/network";
import { WalletConnect } from "@web3-react/walletconnect";
// import { TorusWallet } from "@components/../lib/torus";
import CID from "cids";
import type { AddEthereumChainParameter, Connector } from "@web3-react/types";
import { ethers } from "ethers";
import { CHAIN_DEPLOYMENT, getAddChainParameters } from "@components/../chains";
import { encode, decode } from "url-safe-base64";
import { base32 } from "multiformats/bases/base32";
import { base16 } from "multiformats/bases/base16";
import * as multiformats from "multiformats/cid";
import { Web3AuthConnector } from "@lib/web3auth";
import {
  LogoCoinbase,
  LogoMetamask,
  LogoTorus,
  LogoWalletConnect,
} from "@icons";
import {
  ResearchObject,
  ResearchObjectComponentType,
  ResearchObjectV1,
  ResearchObjectV1Component,
} from "@desci-labs/desci-models";

export const KEY_METAMASK_RECONNECT = "metamask:reconnect";

export const triggerTooltips = () => {
  var DOMContentLoaded_event = document.createEvent("Event");
  DOMContentLoaded_event.initEvent("DOMContentLoaded", true, true);
  window.document.dispatchEvent(DOMContentLoaded_event);
};

export const clearLocalStorage = () => {
  localStorage.removeItem(KEY_METAMASK_RECONNECT);
};

export const getCookie = (key: string) => {
  var b = document.cookie.match("(^|;)\\s*" + key + "\\s*=\\s*([^;]+)");
  return b ? b.pop() : "";
};

export const shortAccount = (account: string) => {
  return `${account!.substring(0, 6)}...${account!.substring(38)}`;
};

export const clearCookies = () => {
  const cookies = new Cookies();
  cookies.remove("orcid_expires_in", { path: "/" });
  cookies.remove("orcid", { path: "/" });
  cookies.remove("orcid_refresh_token", { path: "/" });
  cookies.remove("orcid_access_token", { path: "/" });
};

export function getName(connector: Connector) {
  if (connector instanceof MetaMask) return "MetaMask";
  if (connector instanceof WalletConnect) return "WalletConnect";
  if (connector instanceof Web3AuthConnector) return "Torus";
  if (connector instanceof CoinbaseWallet) return "Coinbase Wallet";
  if (connector instanceof Network) return "Network";
  if (connector instanceof GnosisSafe) return "Gnosis Safe";
  return "Unknown";
}

export function getLogo(connector: Connector) {
  if (connector instanceof MetaMask) return LogoMetamask;
  if (connector instanceof WalletConnect) return LogoWalletConnect;
  if (connector instanceof Web3AuthConnector) return LogoTorus;
  if (connector instanceof CoinbaseWallet) return LogoCoinbase;
  if (connector instanceof Network) return LogoMetamask;
  if (connector instanceof GnosisSafe) return LogoMetamask;
  return LogoMetamask;
}

export const COLORS = {
  background: {
    dark: "rgb(20, 25, 40)",
    light: "rgb(20, 25, 40)",
  },
};

export const isWindows = () => {
  return navigator.appVersion.indexOf("Mac") < 0;
};

export const APPROXIMATED_HEADER_HEIGHT = 55;

export const EMPTY_FUNC = () => {};

const transform = require("lodash.transform");
const isEqual = require("lodash.isequal");
const isArray = require("lodash.isarray");
const isObject = require("lodash.isobject");

/**
 * Find difference between two objects
 * @param  {object} origObj - Source object to compare newObj against
 * @param  {object} newObj  - New object with potential changes
 * @return {object} differences
 */
export const deepDiff = (origObj: any, newObj: any) => {
  function changes(newObj: any, origObj: any) {
    let arrayIndexCounter = 0;
    return transform(newObj, function (result: any, value: any, key: any) {
      if (!isEqual(value, origObj[key])) {
        let resultKey = isArray(origObj) ? arrayIndexCounter++ : key;
        result[resultKey] =
          isObject(value) && isObject(origObj[key])
            ? changes(value, origObj[key])
            : value;
      }
    });
  }
  return changes(newObj, origObj);
};

export const MAX_MOBILE_WIDTH = 500;
export const MIN_DESKTOP_WIDTH = 501;

export const cleanupManifestUrl = (url: string) => {
  if (url && process.env.REACT_APP_IPFS_RESOLVER_OVERRIDE) {
    const s = url.split("/");
    const res = `${process.env.REACT_APP_IPFS_RESOLVER_OVERRIDE}/${
      s[s.length - 1]
    }`;
    // console.log(`resolving ${url} => ${res}`);
    return res;
  }
  return url;
};

export const __log = (...message: any[]) => {
  if (process.env.REACT_APP_DEBUG === "1") {
    const errstack = Error().stack?.split("\n");
    console.log(
      "[d]",
      ...message,
      errstack && errstack[2] ? errstack[2].trim() : undefined
    );
  }
  return true;
};

export const getBytesFromCIDString = (cid: string) => {
  const c = new CID(cid);
  const rootStrHex = c.toString("base16");
  const hexEncoded =
    "0x" + (rootStrHex.length % 2 === 0 ? rootStrHex : "0" + rootStrHex);
  return hexEncoded;
};

export const convertUUIDToHex = (uuid: string) => {
  const decoded = decode(uuid + ".");
  const buffer = Base64Binary.decodeArrayBuffer(decoded).slice(0, 32);
  let base64UuidToBase16 = Buffer.from(buffer).toString("hex");
  base64UuidToBase16 =
    "0x" +
    (base64UuidToBase16.length % 2 == 0
      ? base64UuidToBase16
      : "0" + base64UuidToBase16);

  return base64UuidToBase16;
};
(window as any).convertUUIDToHex = convertUUIDToHex;

export const convertHexToPID = (hex: string) => {
  hex = hex.substring(2); // remove 0x
  hex = hex.length % 2 === 1 ? hex.substring(1) : hex;
  const bytes = Buffer.from(hex, "hex");

  const base64encoded = bytes.toString("base64");
  const base64SafePID = encode(base64encoded).replace(/\.$/, "");
  return base64SafePID;
};
(window as any).convertHexToPID = convertHexToPID;

export const convertHexToCID = (hex: string) => {
  hex = hex.substring(2); // remove 0x
  hex = hex.length % 2 === 0 ? hex.substring(1) : hex;
  const cidBytes = Buffer.from(hex, "hex");

  const res2 = base16.decode(hex);
  const cid = multiformats.CID.decode(res2);
  return cid.toString(base32);
};
(window as any).convertHexToCID = convertHexToCID;

/**
 * Utility to prevent layout shift on Windows / when a scrollbar appears
 */
const FIXED_ELEMENTS = [
  { selector: "#fab-node", strategy: "marginRight" },
  { selector: "#manuscript-side-panel", strategy: "right" },
  { selector: "#feedback-button", strategy: "marginRight" },
  {
    selector: "#create-research-object-popover",
    strategy: "paddingRight",
    nudge: 1,
  },
];

export const capitalize = (str: string) => {
  return str.substring(0, 1).toUpperCase() + str.substring(1);
};

/**
 * When a modal appears we want to prevent scrolling on the main document
 *
 * When user is scrolling in a side panel, we lock scroll to prevent overscrolling into the main document
 *
 * The problem with this is the width of the scrollbar causes a layout shift when it disappears, so we adjust FIXED_ELEMENTS above according to the width of the scrollbar
 */

export const restoreScroll = (nudgeForWindows?: boolean) => {
  // debugger;

  FIXED_ELEMENTS.forEach((a) => {
    const el = document.querySelector(a.selector) as HTMLElement;
    if (!el) {
      return;
    }
    (el.style as any)[a.strategy] = "0px";
  });

  document.body.style.overflowY = "scroll";
};

export const lockScroll = (nudgeForWindows?: boolean) => {
  // debugger;
  const appEl = document.body;
  const scrollWidth = getScrollBarWidth(); //appEl.scrollWidth - appEl.clientWidth;

  document.body.style.overflowY = "hidden";

  FIXED_ELEMENTS.forEach((a) => {
    const el = document.querySelector(a.selector) as HTMLElement;
    if (!el) {
      return;
    }
    (el.style as any)[a.strategy] = `${scrollWidth}px`;
  });
};

function getScrollBarWidth() {
  let el = document.createElement("div");
  el.style.cssText = "overflow:scroll; visibility:hidden; position:absolute;";
  document.body.appendChild(el);
  let width = el.offsetWidth - el.clientWidth;
  el.remove();
  return width;
}

export const getChainInfo = () => {
  console.log(CHAIN_DEPLOYMENT);
  return CHAIN_DEPLOYMENT;
};
(window as any).getChainInfo = getChainInfo;

export const getAncestors = (el: HTMLElement | null) => {
  var els = [];
  while ((el = el?.parentNode as HTMLElement)) {
    els.unshift(el);
  }
  return els;
};

export const BytesToHumanFileSize = (size: number) => {
  const i = size == 0 ? 0 : Math.floor(Math.log(size) / Math.log(1000));
  const humanReadable =
    Number((size / Math.pow(1000, i)).toFixed(2)) +
    " " +
    ["B", "kB", "MB", "GB", "TB", "PB"][i];
  return humanReadable;
};
export const isAbsoluteUrl = (url: string) => {
  var r = new RegExp("^(?:[a-z+]+:)?//", "i");
  return r.test(url);
};

export const filterForFirstPdf = (a: ResearchObjectV1Component) =>
  a &&
  a.type !== ResearchObjectComponentType.DATA &&
  a.type !== ResearchObjectComponentType.UNKNOWN &&
  a.type !== ResearchObjectComponentType.DATA_BUCKET &&
  a.starred;

export const filterForNonData = (a: ResearchObjectV1Component) =>
  a &&
  a.type !== ResearchObjectComponentType.DATA &&
  a.type !== ResearchObjectComponentType.UNKNOWN &&
  a.type !== ResearchObjectComponentType.DATA_BUCKET;

export const getStarredNonDataComponentsFromManifest = (
  manifestData: ResearchObjectV1
) => {
  const pdfComponents = manifestData?.components
    ? manifestData.components.filter(filterForFirstPdf)
    : [];
  return pdfComponents;
};

export const getNonDataComponentsFromManifest = (
  manifestData: ResearchObjectV1
) => {
  const nonDataComponents = manifestData?.components
    ? manifestData.components.filter(filterForNonData)
    : [];
  return nonDataComponents;
};

export function extractCodeRepoName(url: string) {
  if (
    url.indexOf("github.com") &&
    url.split("github.com/")[1].split("/").length > 1
  ) {
    const [, , repo] = url.match(
      // eslint-disable-next-line no-useless-escape
      /github.com[\/:]([^\/]+)\/([^\/^.]+)/
    )!;
    return repo;
  }
}

export function arrayXor(arr: any[]): boolean {
  return arr.reduce((acc, val) => acc !== !!val, false);
}
