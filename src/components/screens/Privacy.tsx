
import Footer from "./Web/Landing/Beta/Footer";
import Header from "./Web/Landing/Beta/Header";

const Privacy = () => {
  return (
    <div
      id="app-wrapper"
      className={`flex flex-col h-screen bg-white w-full`}
      style={{ fontFamily: "Inter, sans-serif" }}
    >
      <Header />
      <div className="bg-white w-full">
        <iframe
          title="Desci Nodes terms of service"
          src="https://d3ibh1pfr1vlpk.cloudfront.net/Privacy+statement+DeSci+Nodes+Feb23.html"
          className="w-full mx-auto h-screen bg-white"
        />
      </div>

      <Footer />
    </div>
  );
};

export default Privacy;
