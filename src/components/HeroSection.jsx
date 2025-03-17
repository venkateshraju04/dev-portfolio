import React from "react";
import "../HeroSection.css";
import { Typewriter } from "react-simple-typewriter";
import {
  FaLinkedin,
  FaGithub,
  FaCode,
  FaExternalLinkAlt,
} from "react-icons/fa";

export default function HeroSection() {
  return (
    <div>
      {/* Hero Section */}
      <div
        className="relative flex items-center justify-start px-8 h-screen mx-auto"
        id="home"
      >
        {/* Hero Content */}
        <div
          className="relative z-10 max-w-7xl w-full text-center lg:text-left text-white px-30"
          style={{ fontFamily: "Montserrat, sans-serif" }}
        >
          <h2 className="text-3xl text-green-400 py-5">Hey there!, I'm</h2>
          <h1 className="text-8xl font-extrabold mb-4 drop-shadow-[0_0_6px_rgba(192,132,252,0.8)]">
            VENKATESH
          </h1>
          <h2 className="text-4xl text-sky-400">
            I'm a{" "}
            <span id="type-skill" className="text-purple-400">
              <Typewriter
                words={[
                  "Web Developer.",
                  "Software Developer.",
                  "Tech Enthusiast!",
                ]}
                loop={true}
                cursor
                cursorStyle="|"
                typeSpeed={70}
                deleteSpeed={50}
              />
            </span>
          </h2>
          {/* Profile Links */}
          <div className="flex gap-4 mt-8">
            <a
              href="https://www.linkedin.com/in/venkateshraju04"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-5 py-2 bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-lg transition-all duration-300 shadow-lg"
            >
              <FaLinkedin size={20} /> LinkedIn
            </a>
            <a
              href="https://github.com/venkateshraju04"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-5 py-2 bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-lg transition-all duration-300 shadow-lg"
            >
              <FaGithub size={20} /> GitHub
            </a>
            <a
              href="https://leetcode.com/u/venkateshraju04"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-5 py-2 bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-lg transition-all duration-300 shadow-lg"
            >
              <FaCode size={20} /> LeetCode
            </a>
          </div>
        </div>
      </div>
      {/* About Me Section */}
      <div
        id="about"
        className="relative py-5 max-w-7xl mx-auto px-10 text-white scroll-mt-20"
        style={{ fontFamily: "Montserrat, sans-serif" }}
      >
        <h2 className="text-5xl font-extrabold mb-4 text-sky-300 drop-shadow-[0_0_7px_rgba(192,132,252,0.8)]">
          ABOUT ME
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <p className="text-3xl text-gray-300 pt-5">Hey!, I'm Venkatesh.</p>
          <p className="text-xl text-gray-300 mt-4">
            I’ve been passionate about computer technology since childhood,
            always curious about how things work behind the scenes. This
            curiosity led me to dive deep into development and programming.
            <br />
            <br />
            I’m currently expanding my skills in AWS and exploring the world of
            machine learning, constantly pushing myself to learn and grow.
          </p>
        </div>
      </div>
      {/* Skills Section */}
      <div
        id="skills"
        className="relative py-5 max-w-7xl mx-auto px-10 text-white mt-25"
        style={{ fontFamily: "Montserrat, sans-serif" }}
      >
        <h2 className="text-5xl font-extrabold mb-4 text-purple-400  drop-shadow-[0_0_7px_rgba(192,132,252,0.8)]">
          SKILLS
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 items-start text-white">
          <div className="text-3xl font-bold md:col-span-2">
            WEB TECHNOLOGIES
          </div>
          <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-2 mb-4">
              <img
                src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/html5/html5-original.svg"
                className="w-10 h-10"
              />
              <span>HTML 5</span>
            </div>
            <div className="flex items-center space-x-2 mb-4">
              <img
                src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/css3/css3-original.svg"
                className="w-10 h10"
              />
              <span>CSS 3</span>
            </div>
            <div className="flex items-center space-x-2 mb-4">
              <img
                src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg"
                className="w-10 h-10"
              />
              <span>JavaScript</span>
            </div>
            <div className="flex items-center space-x-2 mb-4">
              <img
                src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg"
                className="w-10 h-10"
              />
              <span>React</span>
            </div>
            <div className="flex items-center space-x-2 mb-4">
              <img
                src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg"
                className="w-10 h-10"
              />
              <span>Node.js</span>
            </div>
            <div className="flex items-center space-x-2 mb-4">
              <img
                src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/tailwindcss/tailwindcss-original.svg"
                className="h-10 w-10"
              />

              <span>TailwindCSS</span>
            </div>
            <div className="flex items-center space-x-2 mb-4">
              <img
                src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/bootstrap/bootstrap-original.svg"
                className="h-10 w-10"
              />

              <span>Bootstrap</span>
            </div>
          </div>

          <div className="text-3xl font-bold md:col-span-2">
            PROGRAMMING LANGUAGES
          </div>
          <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-2 mb-4">
              <img
                src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/cplusplus/cplusplus-original.svg"
                className="h-10 w-10"
              />

              <span>C++</span>
            </div>
            <div className="flex items-center space-x-2 mb-4">
              <img
                src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/python/python-original.svg"
                className="h-10 w-10"
              />

              <span>Python</span>
            </div>
            <div className="flex items-center space-x-2 mb-4">
              <img
                src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/java/java-original.svg"
                className="h-10 w-10"
              />

              <span>Java</span>
            </div>
          </div>

          <div className="text-3xl font-bold md:col-span-2">DATABASE</div>
          <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-2 mb-4">
              <img
                src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mysql/mysql-original.svg"
                className="w-10 h-10"
              />
              <span>MySQL</span>
            </div>
            <div className="flex items-center space-x-2 mb-4">
              <img
                src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/postgresql/postgresql-original.svg"
                className="w-10 h-10"
              />
              <span>PostgreSQL</span>
            </div>
            <div className="flex items-center space-x-2 mb-4">
              <img
                src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/mongodb/mongodb-original.svg"
                className="w-10 h-10"
              />
              <span>MongoDB</span>
            </div>
          </div>
          <div className="text-3xl font-bold md:col-span-2">TOOLS</div>
          <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-2 mb-4">
              <img
                src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/git/git-original.svg"
                className="w-10 h-10"
              />
              <span>Git</span>
            </div>
            <div className="flex items-center space-x-2 mb-4">
              <img
                src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/vscode/vscode-original.svg"
                className="w-10 h-10"
              />
              <span>VS Code</span>
            </div>
          </div>
        </div>
      </div>

      {/* Projects Section */}
      <div
        id="projects"
        className="relative py-5 max-w-7xl mx-auto px-10 text-white scroll-mt-20 mt-25"
        style={{ fontFamily: "Montserrat, sans-serif" }}
      >
        <h2 className="text-5xl font-extrabold mb-4 text-sky-300  drop-shadow-[0_0_7px_rgba(192,132,252,0.8)]">
          PROJECTS
        </h2>
        <div className="text-xl text-gray-300 mb-8">
          <p>Here's some of my projects that I have worked on.</p>
          <a
            href="https://www.github.com/venkateshraju04"
            target="_blank"
            className="text-green-400 hover:text-green-300 inline-flex items-center"
          >
            Explore more <span className="ml-1">→</span>
          </a>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column - First Project */}
          <div className="flex items-center justify-center h-full">
            <div className="bg-gray-900 rounded-lg overflow-hidden shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-[1.01] w-full">
              <div className="h-60 overflow-hidden">
                <img
                  src="/images/chat_sync.png"
                  alt="Chat Sync"
                  className="w-full object-cover"
                />
              </div>
              <div className="p-6">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-xl font-bold text-white">Chat Sync</h3>
                  <a
                    href="https://github.com/venkateshraju04/Chat-Sync"
                    className="text-gray-400 hover:text-white"
                  >
                    <FaExternalLinkAlt />
                  </a>
                </div>
                <div className="flex gap-2 mb-3">
                  <span className="flex items-center gap-1 px-2 py-1 bg-blue-600 bg-opacity-30 text-blue-300 rounded-md text-xs">
                    <img
                      src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/react/react-original.svg"
                      alt="React"
                      className="w-4 h-4"
                    />
                    React
                  </span>
                  <span className="flex items-center gap-1 px-2 py-1 bg-blue-600 bg-opacity-30 text-blue-300 rounded-md text-xs">
                    <img
                      src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/nodejs/nodejs-original.svg"
                      className="w-4 h-4"
                    />
                    Node.js
                  </span>
                  <span className="flex items-center gap-1 px-2 py-1 bg-blue-600 bg-opacity-30 text-blue-300 rounded-md text-xs">
                    <img
                      src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/mongodb/mongodb-original.svg"
                      className="w-4 h-4"
                    />
                    MongoDB
                  </span>
                </div>
                <p className="text-gray-400">
                  A real-time chat application using MERN stack, enabling
                  seamless communication between registered users. Users can
                  share iamges and change profile pictures as well.
                </p>
              </div>
            </div>
          </div>

          {/* Right Column - Two Projects */}
          <div className="space-y-6">
            {/* First Project on Right */}
            <div className="bg-gray-900 rounded-lg overflow-hidden shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-[1.01]">
              <div className="h-60 overflow-hidden">
                <img
                  src="/images/python_proj.png"
                  alt="Student Progress Report Generator"
                  className="w-full object-cover"
                />
              </div>
              <div className="p-6">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-xl font-bold text-white">
                    Student Progress Report Generator
                  </h3>
                  <a
                    href="https://github.com/venkateshraju04/Student-Report-Card-Generator"
                    className="text-gray-400 hover:text-white"
                  >
                    <FaExternalLinkAlt />
                  </a>
                </div>
                <div className="flex gap-2 mb-3">
                  <span className="flex items-center gap-1 px-2 py-1 bg-blue-600 bg-opacity-30 text-blue-300 rounded-md text-xs">
                    <img
                      src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/python/python-original.svg"
                      className="h-4 w-4"
                    />
                    Python
                  </span>
                </div>
                <p className="text-gray-400">
                  A python program that generates student progress report cards
                  in .pdf format by fetching marks from an excel sheet. Capable
                  of generating 100 report cards in just 0.39 seconds.
                </p>
              </div>
            </div>

            {/* Second Project on Right */}
            <div className="bg-gray-900 rounded-lg overflow-hidden shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-[1.01]">
              <div className="h-60 overflow-hidden">
                <img
                  src="/images/blockchain.png"
                  alt="Blockchain Voting System"
                  className="w-full object-cover"
                />
              </div>
              <div className="p-6">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-xl font-bold text-white">
                    Blockchain Based Voting System
                  </h3>
                  <a
                    href="https://github.com/IlluminatorBlock/Blockchain_Voting"
                    className="text-gray-400 hover:text-white"
                  >
                    <FaExternalLinkAlt />
                  </a>
                </div>
                <div className="flex gap-2 mb-3">
                  <span className="flex items-center gap-1 px-2 py-1 bg-blue-600 bg-opacity-30 text-blue-300 rounded-md text-xs">
                    <img
                      src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/django/django-plain.svg"
                      className="h-4 w-4"
                    />
                    Django
                  </span>
                  <span className="flex items-center gap-1 px-2 py-1 bg-blue-600 bg-opacity-30 text-blue-300 rounded-md text-xs">
                    Web3.py
                  </span>
                  <span className="flex items-center gap-1 px-2 py-1 bg-blue-600 bg-opacity-30 text-blue-300 rounded-md text-xs">
                    <img
                      src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/react/react-original.svg"
                      alt="React"
                      className="w-4 h-4"
                    />
                    React
                  </span>
                </div>
                <p className="text-gray-400">
                  It's an easy to use API to get today's (and tomorrow's!)
                  prayer time in any city in the world, based on Muslim Pro.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Contact Section */}
      <div
        id="contact"
        className="relative flex items-center justify-center py-55 mx-auto"
      >
        <div
          className="relative z-10 max-w-4xl w-full text-center text-white"
          style={{ fontFamily: "Montserrat, sans-serif" }}
        >
          <h2 className="text-5xl font-bold text-purple-400 mb-6 drop-shadow-[0_0_7px_rgba(192,132,252,0.8)]">
            CONTACT ME
          </h2>
          <p className="text-lg mb-8">
            Got a project or just want to connect? Feel free to reach out!
          </p>
          <div className="flex justify-center gap-4">
            <a
              href="mailto:venkateshraju290204@gmail.com"
              className="flex items-center gap-2 px-5 py-2 bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-lg transition-all duration-300 shadow-lg"
            >
              📧 Email Me
            </a>
            <a
              href="https://www.linkedin.com/in/venkateshraju04"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-5 py-2 bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-lg transition-all duration-300 shadow-lg"
            >
              <FaLinkedin size={20} /> LinkedIn
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
