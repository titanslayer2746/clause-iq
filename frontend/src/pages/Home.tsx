import { Link } from "react-router-dom";

const Home = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation Header */}
      <nav className="bg-black border-b-4 border-yellow-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <img
                src="/logo.jpeg"
                alt="Clause-IQ Logo"
                className="h-10 w-10 rounded object-cover"
              />
              <span className="text-2xl font-bold text-yellow-400">
                CLAUSE-IQ
              </span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a
                href="#features"
                className="text-white hover:text-yellow-400 font-medium transition"
              >
                FEATURES
              </a>
              <a
                href="#how-it-works"
                className="text-white hover:text-yellow-400 font-medium transition"
              >
                HOW IT WORKS
              </a>
              <a
                href="#benefits"
                className="text-white hover:text-yellow-400 font-medium transition"
              >
                BENEFITS
              </a>
              <Link
                to="/login"
                className="text-white hover:text-yellow-400 font-medium transition"
              >
                LOGIN
              </Link>
              <Link
                to="/signup"
                className="bg-yellow-400 text-black px-6 py-2 rounded-lg font-bold hover:bg-yellow-300 transition transform hover:scale-105"
              >
                START FREE
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section - Yellow */}
      <section className="bg-yellow-400 py-20 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="z-10">
              <h1 className="text-5xl md:text-6xl font-black text-black leading-tight mb-6">
                INTELLIGENT CONTRACT MANAGEMENT
                <span className="block text-white">POWERED BY AI</span>
              </h1>
              <p className="text-xl text-black mb-8 font-medium">
                Stop drowning in paperwork. Let AI extract, analyze, and manage
                your contracts automatically.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/signup"
                  className="bg-black text-yellow-400 px-8 py-4 rounded-lg font-bold text-lg hover:bg-gray-900 transition transform hover:scale-105 text-center"
                >
                  GET STARTED FREE →
                </Link>
                <a
                  href="#demo"
                  className="bg-white text-black px-8 py-4 rounded-lg font-bold text-lg hover:bg-gray-100 transition text-center"
                >
                  SEE DEMO
                </a>
              </div>
              <p className="mt-6 text-sm text-black">
                ✓ No credit card required &nbsp; ✓ 5-minute setup &nbsp; ✓ Free
                forever plan
              </p>
            </div>
            <div className="relative flex justify-center lg:justify-end">
              <div className="bg-black rounded-2xl p-4 shadow-2xl border-4 border-black transform rotate-2 hover:rotate-0 transition-transform duration-300 max-w-md">
                <img
                  src="/contract-agreement-img.png"
                  alt="AI Contract Analysis"
                  className="rounded-lg w-full h-auto"
                />
                <div className="absolute -bottom-4 -right-4 bg-yellow-400 text-black px-4 py-2 rounded-lg font-bold text-sm shadow-lg border-2 border-black flex items-center gap-2">
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" />
                  </svg>
                  98% ACCURATE
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Decorative Elements */}
        <div className="absolute top-10 right-10 w-32 h-32 bg-black rounded-full opacity-10"></div>
        <div className="absolute bottom-10 left-10 w-48 h-48 bg-white rounded-full opacity-10"></div>
      </section>

      {/* Problem Statement - Black */}
      <section className="bg-black py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-white mb-6">
              DROWNING IN{" "}
              <span className="text-yellow-400">CONTRACT CHAOS?</span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Legal teams waste 60% of their time on manual contract review.
              Miss a deadline? That's a $500K mistake.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-lg border-4 border-yellow-400 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-20 h-20 bg-yellow-400 rounded-bl-full opacity-20"></div>
              <div className="relative z-10">
                <div className="w-16 h-16 bg-black rounded-lg flex items-center justify-center mb-4">
                  <svg
                    className="w-10 h-10 text-yellow-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-black mb-3">
                  Manual Review Hell
                </h3>
                <p className="text-gray-700">
                  Hours spent reading every page, highlighting clauses, copying
                  data into spreadsheets.
                </p>
              </div>
            </div>
            <div className="bg-white p-8 rounded-lg border-4 border-yellow-400 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-20 h-20 bg-yellow-400 rounded-bl-full opacity-20"></div>
              <div className="relative z-10">
                <div className="w-16 h-16 bg-black rounded-lg flex items-center justify-center mb-4">
                  <svg
                    className="w-10 h-10 text-yellow-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-black mb-3">
                  Missed Deadlines
                </h3>
                <p className="text-gray-700">
                  Renewal dates buried in 50-page PDFs. No tracking. No
                  reminders. Just surprises.
                </p>
              </div>
            </div>
            <div className="bg-white p-8 rounded-lg border-4 border-yellow-400 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-20 h-20 bg-yellow-400 rounded-bl-full opacity-20"></div>
              <div className="relative z-10">
                <div className="w-16 h-16 bg-black rounded-lg flex items-center justify-center mb-4">
                  <svg
                    className="w-10 h-10 text-yellow-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-black mb-3">
                  Hidden Risks
                </h3>
                <p className="text-gray-700">
                  Unfavorable terms slip through. Unlimited liability.
                  Auto-renewals. Compliance failures.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* AI Features - Yellow */}
      <section id="features" className="bg-yellow-400 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-black mb-6">
              AI DOES THE <span className="text-white">HEAVY LIFTING</span>
            </h2>
            <p className="text-xl text-black max-w-3xl mx-auto font-medium">
              Upload once. AI extracts everything. You just review and approve.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                svg: (
                  <svg
                    className="w-12 h-12 text-yellow-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                ),
                title: "SMART EXTRACTION",
                desc: "AI reads contracts, extracts parties, dates, amounts, key clauses automatically.",
              },
              {
                svg: (
                  <svg
                    className="w-12 h-12 text-yellow-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                ),
                title: "RISK DETECTION",
                desc: "Flags unfavorable terms, unlimited liability, auto-renewal clauses instantly.",
              },
              {
                svg: (
                  <svg
                    className="w-12 h-12 text-yellow-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                    />
                  </svg>
                ),
                title: "COMPLIANCE CHECK",
                desc: "Compares against your playbook. Shows deviations with recommendations.",
              },
              {
                svg: (
                  <svg
                    className="w-12 h-12 text-yellow-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    />
                  </svg>
                ),
                title: "AI ASSISTANT",
                desc: 'Ask "What\'s the termination notice?" Get answers with exact source citations.',
              },
            ].map((feature, idx) => (
              <div
                key={idx}
                className="bg-black p-6 rounded-lg transform hover:scale-105 transition"
              >
                <div className="mb-4">{feature.svg}</div>
                <h3 className="text-lg font-bold text-yellow-400 mb-3">
                  {feature.title}
                </h3>
                <p className="text-white text-sm">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Demo/Screenshots - Black */}
      <section id="demo" className="bg-black py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-white mb-6">
              SEE IT IN <span className="text-yellow-400">ACTION</span>
            </h2>
          </div>

          <div className="bg-yellow-400 p-6 rounded-2xl shadow-2xl border-4 border-yellow-400 transform hover:scale-105 transition-transform duration-300">
            <img
              src="/dashboard-img.png"
              alt="Clause-IQ Dashboard"
              className="rounded-lg w-full h-auto"
            />
            <div className="mt-4 flex items-center justify-center gap-4">
              <div className="bg-black text-yellow-400 px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
                LIVE DASHBOARD
              </div>
              <div className="bg-white text-black px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                REAL DATA
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works - Black */}
      <section id="how-it-works" className="bg-black py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-white mb-6">
              FROM <span className="text-yellow-400">PDF TO INSIGHTS</span> IN
              60 SECONDS
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              {
                step: "01",
                title: "UPLOAD",
                desc: "Drag & drop your PDF or DOCX contract",
              },
              {
                step: "02",
                title: "AI EXTRACTS",
                desc: "AI reads and extracts all key data",
              },
              {
                step: "03",
                title: "REVIEW",
                desc: "See parties, dates, risks, compliance scores",
              },
              {
                step: "04",
                title: "MANAGE",
                desc: "Track deadlines, assign tasks, collaborate",
              },
            ].map((item, idx) => (
              <div key={idx} className="relative">
                <div className="bg-yellow-400 p-8 rounded-lg text-center">
                  <div className="text-6xl font-black text-black mb-4">
                    {item.step}
                  </div>
                  <h3 className="text-xl font-bold text-black mb-3">
                    {item.title}
                  </h3>
                  <p className="text-black font-medium">{item.desc}</p>
                </div>
                {idx < 3 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                    <div className="text-yellow-400 text-4xl">→</div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Key Benefits - Yellow */}
      <section id="benefits" className="bg-yellow-400 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl md:text-5xl font-black text-black mb-8">
                SAVE 20+ HOURS
                <span className="block text-white">PER CONTRACT</span>
              </h2>
              <div className="space-y-6">
                {[
                  {
                    shape: (
                      <div className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center">
                        <div className="w-6 h-6 bg-black rotate-45"></div>
                      </div>
                    ),
                    title: "90% Faster Review",
                    desc: "What took hours now takes minutes",
                  },
                  {
                    shape: (
                      <div className="w-12 h-12 bg-yellow-400 flex items-center justify-center">
                        <div className="w-8 h-8 border-4 border-black rounded-full"></div>
                      </div>
                    ),
                    title: "Zero Missed Deadlines",
                    desc: "Auto-generated tasks & reminders",
                  },
                  {
                    shape: (
                      <div className="w-12 h-12 bg-yellow-400 rounded-lg flex items-center justify-center">
                        <div className="w-6 h-6 bg-black"></div>
                      </div>
                    ),
                    title: "Risk-Free Contracts",
                    desc: "AI flags every unfavorable term",
                  },
                  {
                    shape: (
                      <div className="w-12 h-12 bg-yellow-400 flex items-center justify-center">
                        <svg
                          className="w-8 h-8 text-black"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={3}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      </div>
                    ),
                    title: "100% Compliant",
                    desc: "Automatic playbook checking",
                  },
                ].map((benefit, idx) => (
                  <div
                    key={idx}
                    className="flex items-start space-x-4 bg-black p-4 rounded-lg"
                  >
                    <div className="flex-shrink-0">{benefit.shape}</div>
                    <div>
                      <h3 className="text-lg font-bold text-yellow-400">
                        {benefit.title}
                      </h3>
                      <p className="text-white text-sm">{benefit.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative group">
              <div className="bg-black p-6 rounded-2xl border-4 border-black shadow-2xl transform hover:rotate-1 transition-transform duration-300">
                <img
                  src="/icon-illustration.png"
                  alt="Contract Intelligence"
                  className="rounded-lg w-full h-auto"
                />
              </div>
              <div className="absolute -bottom-6 -left-6 bg-yellow-400 text-black px-6 py-3 rounded-lg font-black text-lg shadow-lg border-4 border-black group-hover:scale-110 transition-transform flex items-center gap-2">
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" />
                </svg>
                INSTANT INSIGHTS
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section - Black */}
      <section className="bg-black py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-6xl font-black text-white mb-6">
            READY TO GO <span className="text-yellow-400">INTELLIGENT?</span>
          </h2>
          <p className="text-xl text-gray-300 mb-10">
            Join forward-thinking legal teams managing contracts 10x faster with
            AI.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link
              to="/signup"
              className="bg-yellow-400 text-black px-10 py-5 rounded-lg font-black text-xl hover:bg-yellow-300 transition transform hover:scale-105"
            >
              START FREE NOW →
            </Link>
            <Link
              to="/login"
              className="bg-white text-black px-10 py-5 rounded-lg font-black text-xl hover:bg-gray-100 transition"
            >
              LOGIN
            </Link>
          </div>
          <p className="mt-8 text-gray-400 text-sm">
            Free forever plan • No credit card • Setup in 5 minutes
          </p>
        </div>
      </section>

      {/* Footer - Yellow */}
      <footer className="bg-yellow-400 py-12 border-t-4 border-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <img
                  src="/logo.jpeg"
                  alt="Clause-IQ Logo"
                  className="h-10 w-10 rounded object-cover"
                />
                <span className="text-xl font-bold text-black">CLAUSE-IQ</span>
              </div>
              <p className="text-sm text-black font-medium">
                AI-powered contract intelligence for modern legal teams.
              </p>
            </div>

            <div>
              <h3 className="font-bold text-black mb-4">PRODUCT</h3>
              <ul className="space-y-2 text-sm text-black">
                <li>
                  <a href="#features" className="hover:text-white transition">
                    Features
                  </a>
                </li>
                <li>
                  <a
                    href="#how-it-works"
                    className="hover:text-white transition"
                  >
                    How It Works
                  </a>
                </li>
                <li>
                  <Link to="/signup" className="hover:text-white transition">
                    Pricing
                  </Link>
                </li>
                <li>
                  <a href="#demo" className="hover:text-white transition">
                    Demo
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold text-black mb-4">COMPANY</h3>
              <ul className="space-y-2 text-sm text-black">
                <li>
                  <a href="#" className="hover:text-white transition">
                    About Us
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition">
                    Blog
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition">
                    Careers
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition">
                    Contact
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold text-black mb-4">LEGAL</h3>
              <ul className="space-y-2 text-sm text-black">
                <li>
                  <a href="#" className="hover:text-white transition">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition">
                    Terms of Service
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition">
                    Security
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t-2 border-black pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-black font-medium text-sm">
              © 2025 Clause-IQ. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="text-black hover:text-white transition">
                <svg
                  className="h-6 w-6"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </a>
              <a href="#" className="text-black hover:text-white transition">
                <svg
                  className="h-6 w-6"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
                </svg>
              </a>
              <a href="#" className="text-black hover:text-white transition">
                <svg
                  className="h-6 w-6"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
