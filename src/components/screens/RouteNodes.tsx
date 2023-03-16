import ManuscriptReader from "@src/components/organisms/ManuscriptReader";
import PaneNodeCollection from "@src/components/organisms/PaneNodeCollection";
import { Navigate, Route, Routes } from "react-router-dom";

export default function Nodes() {
  return (
    <Routes>
      <Route path="start" element={<PaneNodeCollection />} />
      <Route path="objects">
        <Route path=":cid" element={<ManuscriptReader />} />
      </Route>
      <Route index element={<Navigate to="start" />} />
    </Routes>
  );
}
