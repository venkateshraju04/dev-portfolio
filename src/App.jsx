// App.jsx
import "./App.css";
import Navbar from "./components/Navbar.jsx";
import HeroSection from "./components/HeroSection.jsx";
import "./assets/stars.css";
import AOS from "aos";
import "aos/dist/aos.css";
import { useEffect } from "react";

function App() {
  useEffect(() => {
    AOS.init({
      duration: 1000, // Animation duration in milliseconds
      once: true, // Animation only happens once when scrolling down
    });
  }, []);
  return (
    <div className="relative overflow-x-hidden global-background bg-slate-950">
      {}
      <div id="stars"></div>
      <div id="stars2"></div>

      <Navbar />

      <section id="hero">
        <HeroSection />
      </section>
    </div>
  );
}

export default App;
