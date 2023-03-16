import Landing from "@src/components/screens/Web/Landing";
import ManuscriptReader from "@src/components/organisms/ManuscriptReader";
import { useParams } from "react-router-dom";

const WildcardChecker = () => {
  /** Test if we should load a published node */
  // const reserved = ["magic", "", "auth/link", "magic", "magic/expired"];
  // const params = useParams();
  // const fragment = (params as any)[0];
  // if (reserved.indexOf(fragment) < 0) {
  //   return <ManuscriptReader publicView={true} />;
  // }
  return <Landing />;
};

export default WildcardChecker;
