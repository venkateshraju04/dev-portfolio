// App.jsx
import "./App.css";
import Navbar from "./components/Navbar.jsx";
import HeroSection from "./components/HeroSection.jsx";
import "./assets/stars.css";
function App() {
  return (
    <div className="relative overflow-x-hidden global-background bg-slate-950">
      {}
      <Navbar />

      <section id="hero">
        <HeroSection />
      </section>
    </div>
  );
}

export default App;
