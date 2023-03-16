import AppMenuProvider from "@src/components/screens/Web/Landing/Beta/useAppMenu";
import { Route, Routes } from "react-router-dom";
import { web } from "@src/constants/routes";
import BetaLanding from "@src/components/screens/Web/Landing/Beta";
import Login from "./Landing/Beta/Login/Login";

export default function BetaWeb() {
  return (
    <AppMenuProvider>
      <div
        className="flex flex-col min-h-screen bg-gradient-to-b from-black to-neutrals-black overflow-x-hidden"
        style={{ fontFamily: "Inter, sans-serif" }}
      >
        <div className="min-h-[65vh]">
          <Routes>
            <Route index element={<BetaLanding />} />
            <Route path={`${web.login}`} element={<Login />} />
          </Routes>
        </div>
      </div>
    </AppMenuProvider>
  );
}
