import React, { useState } from "react";

export default function Navbar() {
  const [activeLink, setActiveLink] = useState("home");
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const handleSmoothScroll = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleSetActiveLink = (link) => {
    setActiveLink(link);
  };

  const handleMobileMenuToggle = () => {
    setShowMobileMenu(!showMobileMenu);
  };

  return (
    <nav className="fixed top-0 left-0 w-full bg-slate-950 text-white z-50">
      {/* Center content and add padding */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {" "}
          {/* Increased height */}
          {/* Logo */}
          <div
            className="text-5xl font-extrabold text-purple-500 drop-shadow-[0_0_15px_rgba(192,132,252,0.8)]"
            style={{ fontFamily: "Bebas Neue, sans-serif" }}
          >
            &lt; /&gt;
          </div>
          {/* Nav Links */}
          <div
            className="hidden md:flex space-x-20 text-3xl drop-shadow-[0_0_6px_rgba(192,132,252,0.8)]"
            style={{ fontFamily: "Bebas Neue, sans-serif" }}
          >
            <button
              className={`hover:text-purple-400 ${
                activeLink === "home" ? "text-purple-300" : ""
              }`}
              onClick={() => {
                handleSetActiveLink("home");
                handleSmoothScroll("home");
              }}
            >
              Home
            </button>
            <button
              className={`hover:text-purple-400 ${
                activeLink === "about" ? "text-purple-300" : ""
              }`}
              onClick={() => {
                handleSetActiveLink("about");
                handleSmoothScroll("about");
              }}
            >
              About
            </button>
            <button
              className={`hover:text-purple-400 ${
                activeLink === "projects" ? "text-purple-300" : ""
              }`}
              onClick={() => {
                handleSetActiveLink("projects");
                handleSmoothScroll("projects");
              }}
            >
              Projects
            </button>
            <button
              className={`hover:text-purple-400 ${
                activeLink === "contact" ? "text-purple-300" : ""
              }`}
              onClick={() => {
                handleSetActiveLink("contact");
                handleSmoothScroll("contact");
              }}
            >
              Contact
            </button>
          </div>
          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              className="text-white focus:outline-none"
              onClick={handleMobileMenuToggle}
            >
              ☰
            </button>
          </div>
          {/* Mobile Menu */}
          {showMobileMenu && (
            <div className="md:hidden absolute top-20 right-0 bg-purple-400 text-white w-40 p-4 flex flex-col space-y-4">
              <button
                className={`text-2xl hover:text-gray-200 ${
                  activeLink === "home" ? "text-gray-200" : ""
                }`}
                onClick={() => {
                  handleSetActiveLink("home");
                  handleSmoothScroll("home");
                  handleMobileMenuToggle();
                }}
              >
                Home
              </button>
              <button
                className={`text-2xl hover:text-gray-200 ${
                  activeLink === "about" ? "text-gray-200" : ""
                }`}
                onClick={() => {
                  handleSetActiveLink("about");
                  handleSmoothScroll("about");
                  handleMobileMenuToggle();
                }}
              >
                About
              </button>
              <button
                className={`text-2xl hover:text-gray-200 ${
                  activeLink === "projects" ? "text-gray-200" : ""
                }`}
                onClick={() => {
                  handleSetActiveLink("projects");
                  handleSmoothScroll("projects");
                  handleMobileMenuToggle();
                }}
              >
                Projects
              </button>
              <button
                className={`text-2xl hover:text-gray-200 ${
                  activeLink === "contact" ? "text-gray-200" : ""
                }`}
                onClick={() => {
                  handleSetActiveLink("contact");
                  handleSmoothScroll("contact");
                  handleMobileMenuToggle();
                }}
              >
                Contact
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
