import OrcidButton from "@src/components/molecules/OrcIdAuthButton/OrcIdAuthButton";
import { logout } from "@api/index";
import { useNavigate } from "react-router-dom";
import { site } from "@src/constants/routes";
import { useUser } from "@src/state/user/hooks";

const LinkAuth = () => {
  const userProfile = useUser();
  const navigate = useNavigate();

  return (
    <div className="lg:mt-20">
      <div className="mt-6 sm:max-w-xl">
        <h1 className="text-2xl font-extrabold text-white tracking-tight sm:text-4xl">
          Welcome
        </h1>
      </div>

      <div className="min-w-0 flex-1 my-4 text-tint-primary">
        Link your account in order to continue
      </div>
      <div className="mt-2">
        <OrcidButton />
      </div>
      {userProfile && userProfile.email ? (
        <div className="mt-10 text-white text-xs">
          Signed in as {userProfile.email} (
          <span
            onClick={async () => {
              await logout();
              navigate(site.web);
            }}
            className="hover:underline cursor-pointer"
          >
            sign out
          </span>
          )
        </div>
      ) : null}
    </div>
  );
};

export default LinkAuth;
