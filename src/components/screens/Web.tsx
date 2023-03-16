import Footer from "@src/components/organisms/Footer";
import Landing from "@src/components/screens/Web/Landing";

export default function Web() {
  return (
    <div
      id="app-wrapper"
      className={`flex flex-col min-h-screen h-screen`}
      style={{ fontFamily: "Inter, sans-serif" }}
    >
      <Landing />
      <Footer />
    </div>
  );
}
