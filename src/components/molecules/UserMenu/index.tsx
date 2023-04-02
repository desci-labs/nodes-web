import { LOCALSTORAGE_ORCID_JWT } from "@src/lib/orcIdLib";
import { clearCookies, clearLocalStorage, isWindows } from "@components/utils";
import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/solid";
import jsonwebtoken from "jsonwebtoken";
import { useEffect, useRef, useState } from "react";
import SwirlingUniverse from "@images/swirling-universe.png";
import "./style.scss";
import { useWeb3React } from "@web3-react/core";
import { useEffectOnce } from "react-use";
import FriendReferralButton from "../../organisms/FriendReferral/FriendReferralButton";
import { useNavigate } from "react-router-dom";
import { app, site } from "@src/constants/routes";
import { IconHelp } from "@src/icons";
import { NavLink } from "react-router-dom";
import { TOOLBAR_ENTRY } from "@src/components/organisms/Toolbar";
import { useGetter, useSetter } from "@src/store/accessors";
import {
  resetPreference,
  setOrcid,
  setPreferences,
  setShowReferralModal,
} from "@src/state/preferences/preferencesSlice";
import { logout } from "@src/state/user/userSlice";
import { useUser } from "@src/state/user/hooks";
import { api } from "@src/state/api";
import { tags } from "@src/state/api/tags";
import { ReferAFriendModal } from "@src/components/organisms/FriendReferral/FriendReferralModal";
import WalletManagerModal from "../WalletManagerModal";
function classNames(...classes: any) {
  return classes.filter(Boolean).join(" ");
}
interface Props {
  name: string;
  address?: string;
}

const UserMenu = (props: Props) => {
  const dispatch = useSetter();
  const userProfile = useUser();
  const { torusKey } = useGetter((state) => state.preferences);

  const { account } = useWeb3React();
  const [orcidJwt] = useState(localStorage.getItem(LOCALSTORAGE_ORCID_JWT));
  const [orcidJwtData, setOrcidJwtData] = useState<any>(null);

  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();
  const [doPad, setDoPad] = useState(false);
  const [, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const [openWalet, setOpenWallet] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  useEffectOnce(() => {
    setMounted(true);
    /**
     * Windows needs to shift the UI to the left because scrollbar is visible
     */
    if (isWindows()) {
      setDoPad(true);
    }
  });
  useEffect(() => {
    // debugger;
    if (userProfile && userProfile.email.indexOf("@desci.com") > -1) {
      setIsAdmin(true);
    }
  }, [userProfile]);
  useEffect(() => {
    if (orcidJwt) {
      const data = jsonwebtoken.decode(orcidJwt);
      if (data && data.sub) {
        setOrcidJwtData(data);
      }
    }
  }, [orcidJwt]);
  useEffect(() => {
    console.log(userProfile, account);
    // debugger;
    if (
      userProfile &&
      userProfile.wallets &&
      userProfile.wallets.filter((w: any) => w.address === account).length > 0
    ) {
      setIsConnected(true);
    } else {
      setIsConnected(false);
    }
  }, [userProfile, account]);

  const [minWidth] = useState(140);

  const menuRef = useRef<HTMLDivElement>();

  return (
    <div
      ref={(el) => {
        if (el) {
          menuRef.current = el;
        }
      }}
      className={`${
        open ? "rounded-b-lg" : "rounded-2xl"
      } relative inline-block duration-100 text-left z-[110] select-none group overflow-hidden  transition-all shadow-sm`}
      style={{
        marginRight: doPad ? 10 : undefined,
        height: open ? (isAdmin ? 460 : 260) : 35,
        top: 10,
        position: "absolute",
      }}
      onClick={() => {
        setOpen((opened) => !opened);
      }}
    >
      <>
        <div style={{ position: "relative" }}>
          <button
            className={`bg-[#191B1C] group-hover:bg-neutrals-gray-1 duration-100 z-50 relative justify-between transition-all rounded-3xl overflow-hide shadow-sm focus:outline-nonefocus:ring-offset-0 focus:ring-offset-gray-600 focus:ring-gray-600 flex cursor-pointer py-[1px] px-2 text-xs items-center font-medium text-white ${
              open
                ? "rounded-t-2xl rounded-b-none group-hover:bg-[#191B1C]"
                : "min-w-[100px] rounded-b-none rounded-t-2xl"
            }`}
            onBlur={() => {
              setTimeout(() => {
                setOpen(false);
              }, 100);
            }}
            style={{
              marginTop: 2,
              transformOrigin: "right",
              width: open ? (minWidth > 224 ? minWidth : 224) : minWidth,
            }}
          >
            <div
              className={`block transition-all duration-200 `}
              style={{ width: 20 }}
            >
              <img src={SwirlingUniverse} alt="" style={{ width: 20 }} />
            </div>
            <div
              className={`rounded-3xl text-left ${
                open || true ? "" : "bg-[#222429]"
              }  py-0 h-8 items-center justify-start flex text-xs overflow-ellipsis`}
            >
              {/* {address ? "Profile" : ""} */}
              My Account
            </div>
            <div>
              {open ? (
                <ChevronUpIcon
                  className="-mr-1 ml-1 h-5 w-5 text-gray-100 mt-0.5"
                  aria-hidden="true"
                />
              ) : (
                <ChevronDownIcon
                  className="-mr-1 ml-1 h-5 w-5text-gray-100 mt-0.5"
                  aria-hidden="true"
                />
              )}
            </div>
          </button>
        </div>

        <div
          onClick={(e: any) => {
            e.stopPropagation();
            setOpen((prev) => false);
          }}
          className={`z-50 duration-700 origin-top-right absolute -mr-[0.5px] -mt-0 ${
            open ? "w-56" : "w-36"
          } rounded-b-2xl overflow-hidden rounded-tr-none shadow-lg ring-1 ring-black ring-opacity-5 divide-y divide-gray-100 divide-gray-900 focus:outline-none bg-[#191B1C]`}
          style={{
            right: doPad ? 10.5 : 0.5,
            position: "absolute",
            top: 15,
            paddingTop: 15,
            // opacity: open ? 100 : 0,
            left: 0,
            width: `calc(100% - 0px)`,
            height: "fit-content",
            zIndex: 2,
          }}
        >
          <div
            className="px-4 py-4 hover:bg-[#222429] bg-[#191B1C] cursor-pointer group"
            onClick={() => {
              navigate(`${site.app}${app.profile}`);
            }}
          >
            <p className="text-xs py-1 text-white">Signed in</p>
            <p className="text-xs font-medium text-gray-100 truncate flex">
              {/* <img src={OrcidLogo} className="h-4 mr-1.5 mt-0.5" />{" "} */}
              {props.name}
            </p>
          </div>
          <div
            className={`py-1 hover:bg-[#222429] bg-[#191B1C] cursor-pointer group ${
              !orcidJwtData || !torusKey.publicAddress
                ? `hover:bg-gray-100 bg-white cursor-pointer`
                : `hover:bg-gray-800 cursor-default`
            }`}
            onClick={() => {
              setOpenWallet(true);
            }}
          >
            <div className="">
              <p
                className="text-xs px-4 text-white"
                // data-tip="Torus Wallet - StarkNet Alpha Goerli"
              >
                Digital Signature
              </p>

              <button className="w-full">
                <a
                  href="##"
                  className={classNames(
                    false
                      ? "bg-gray-100 text-gray-900"
                      : `${
                          !torusKey.publicAddress ? "" : "cursor-default"
                        } text-gray-700`,
                    "block px-4 text-xs cursor-pointer"
                  )}
                  onClick={(e: any) => {
                    e.preventDefault();
                    console.log("wallet click 2");
                  }}
                >
                  <p className="text-xs font-medium text-gray-900 truncate justify-start flex w-48">
                    {isConnected ? (
                      <>
                        <span className="text-[rgb(5,199,255)] w-32 justify-start text-left  flex items-start">
                          {/* <IconEthereum
                              width={28}
                              height={20}
                              style={{ filter: "saturate(1)" }}
                            /> */}
                          Ready
                        </span>
                        <span className="text-[rgb(5,199,255)] hover:text-tint-primary-hover w-20 text-right justify-end text-xs">
                          Manage
                        </span>
                      </>
                    ) : (
                      <>
                        <span className="text-gray-500 w-32 justify-start text-left  flex items-start">
                          {/* <IconEthereum
                              width={40}
                              height={20}
                              style={{ filter: "saturate(0)" }}
                            /> */}
                          Not Ready
                        </span>
                        <span className="text-tint-primary group-hover:text-tint-primary-hover w-20 text-right justify-end text-xs">
                          Connect
                        </span>
                      </>
                    )}
                  </p>
                </a>
              </button>
              <WalletManagerModal
                isOpen={openWalet}
                onDismiss={() => {
                  setOpen((opened) => !opened);
                  setOpenWallet(false);
                }}
              />
            </div>
          </div>

          {process.env.REACT_APP_ENABLE_FRIEND_REFERRAL ? (
            <FriendReferralButton
              onHandleClick={() => {
                setOpen((opened) => true);
              }}
            />
          ) : null}
          <div className="py-0">
            <NavLink
              to={`${site.app}${app.help}`}
              onClick={() => {
                dispatch(
                  setPreferences({
                    activeToolbar: TOOLBAR_ENTRY.help,
                    isToolbarVisible: true,
                  })
                );
              }}
              className={classNames(
                "px-4 gap-1 text-xs hover:bg-[#222429] bg-[#191B1C] text-white items-end flex flex-column justify-start hover:bg-[#222429] cursor-pointer w-full py-2"
              )}
            >
              <IconHelp height={16} /> Help
            </NavLink>
          </div>
          <div className="py-0">
            <form method="POST" action="#">
              <button
                type="button"
                className={classNames(
                  false ? "bg-gray-100" : "",
                  "block w-full text-left px-4 py-4 text-xs hover:bg-[#222429] bg-[#191B1C] text-white"
                )}
                onClick={async (e) => {
                  dispatch(setOrcid({ orcidData: {} }));
                  dispatch(resetPreference());
                  dispatch(logout());
                  dispatch(
                    api.util.invalidateTags([
                      { type: tags.user },
                      { type: tags.nodes },
                    ])
                  );
                  try {
                    // metamask.deactivate();
                  } catch (e) {
                    console.error(e);
                  }
                  clearLocalStorage();
                  clearCookies();
                  navigate(site.web);
                }}
              >
                Sign out
              </button>
            </form>
          </div>
        </div>
      </>
      <ReferAFriendModal
        onClose={() => {
          dispatch(setShowReferralModal(false));
          setOpen((opened) => !opened);
        }}
      />
    </div>
  );
};

export default UserMenu;
