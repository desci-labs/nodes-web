import { memo, useEffect } from "react";

import { Link } from "react-router-dom";
import UserMenu from "@components/molecules/UserMenu";
import OrcidButton from "@src/components/molecules/OrcIdAuthButton/OrcIdAuthButton";
import { shortAccount, triggerTooltips } from "@components/utils";
import styled from "styled-components";
import NodeLogo from "@components/atoms/NodeLogo";
import { useGetter, useSetter } from "@src/store/accessors";
import { setOrcid } from "@src/state/preferences/preferencesSlice";

const navigation = [
  // { name: "Home", href: "/" },
  // { name: "ARC", href: "/arcs" },
  // { name: "Browse", href: "/" },
  { name: "My Collection", href: "/manuscript/reader/1" },

  // { name: "Featured Discoveries", href: "/discoveries/list" },
];

const HeadWrapper = styled.div.attrs({
  className: `fixed z-50 w-screen app-header bg-[rgb(51,54,57)] select-none`,
})`
  height: 58px;
  transition: transform 3s ease-in-out;
  ${(params) => (params.hidden ? "transform: translateY(-58px);" : "")};
`;

const Header = () => {
  const {
    orcid: { loading: orcidLoading, orcidData },
    hideHeader,
  } = useGetter((state) => state.preferences);
  const dispatch = useSetter();

  const account = false;
  useEffect(() => {
    const hasOrcid = orcidData && !!orcidData.person;
    if (!hasOrcid && account) {
      dispatch(
        setOrcid({
          orcidData: {
            walletInitiated: true,
            person: {
              name: { "given-names": { value: shortAccount(account) } },
            },
          },
        })
      );
    } else if (!account && orcidData && orcidData.walletInitiated) {
      dispatch(
        setOrcid({
          orcidData: null,
        })
      );
    }
    setTimeout(triggerTooltips);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account, orcidData, orcidLoading]);

  const LogoElement = memo(() => <NodeLogo />);

  return (
    <HeadWrapper hidden={hideHeader}>
      <nav className="max-w-4xl mx-auto flex" aria-label="Top">
        <div className="w-full flex items-center justify-between border-b border-none h-[58px]">
          <div className="flex items-center justify-center gap-4">
            {/* <a href="/" className="block w-20 p-4 relative z-50"> */}
            <div className="">
              <LogoElement />
            </div>
            {/* </a> */}
            <div className="hidden space-x-8 lg:block">
              {navigation.map((link) => (
                <Link
                  key={link.name}
                  to={link.href}
                  className="text-sm text-white hover:text-indigo-50 py-5"
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>
          <div className="py-0 flex flex-wrap justify-center space-x-6 lg:hidden">
            {navigation.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="text-base font-medium text-white hover:text-indigo-50"
              >
                {link.name}
              </a>
            ))}
          </div>
          <div className="ml-10 flex space-x-4">
            {!(orcidData && !!orcidData.person) ? (
              <div className="flex space-x-1.5 flex-row">
                {/* <WalletButton active={false} /> */}
                <OrcidButton active={false} />
              </div>
            ) : (
              <UserMenu name={orcidData.person.name["given-names"].value} />
            )}
          </div>
        </div>
      </nav>
    </HeadWrapper>
  );
};

export default Header;
