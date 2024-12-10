'use client';

import { motion } from "framer-motion";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-teal-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Subtle Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-50/30 to-teal-50/50 pointer-events-none" />

        {/* Modern Navigation */}
        <nav className="py-6 relative z-10 bg-white/70 backdrop-blur-lg rounded-2xl mt-4 px-6 shadow-lg shadow-teal-100">
          <div className="flex justify-between items-center">
            <div className="text-3xl font-bold bg-gradient-to-r from-teal-500 to-cyan-500 text-transparent bg-clip-text">
              TeachStream
            </div>
            <div className="space-x-8">
              <Link href="/features" className="text-gray-600 hover:text-teal-500 transition-colors">
                Features
              </Link>
              <Link href="/pricing" className="text-gray-600 hover:text-teal-500 transition-colors">
                Pricing
              </Link>
              <Link href="/about" className="text-gray-600 hover:text-teal-500 transition-colors">
                About
              </Link>
              <Link href="/login" className="text-gray-600 hover:text-teal-500 transition-colors">
                Login
              </Link>
              <Link 
                href="/signup" 
                className="bg-gradient-to-r from-teal-400 to-cyan-400 text-white px-6 py-2.5 rounded-full hover:opacity-90 transition-all shadow-lg hover:shadow-teal-200"
              >
                Sign Up
              </Link>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="py-32 text-center relative z-10"
        >
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="text-6xl md:text-7xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 text-transparent bg-clip-text mb-8"
          >
            Transform Your Teaching Experience
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.4 }}
            className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed"
          >
            Create interactive teaching sessions, share materials in real-time, and engage with your students through our innovative platform.
          </motion.p>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.6 }}
            className="space-x-6"
          >
            <Link 
              href="/create-session" 
              className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white px-8 py-4 rounded-full hover:opacity-90 transition-all shadow-lg hover:shadow-teal-200 inline-block"
            >
              Start Teaching
            </Link>
            <Link 
              href="/join-session" 
              className="border-2 border-teal-500 text-teal-600 px-8 py-4 rounded-full hover:bg-teal-50 transition-colors inline-block"
            >
              Join Session
            </Link>
          </motion.div>
        </motion.div>

        {/* Features Section */}
        <div className="py-24 relative z-10">
          <h2 className="text-4xl font-bold text-center mb-16 bg-gradient-to-r from-teal-600 to-cyan-600 text-transparent bg-clip-text">
            Powerful Features for Interactive Learning
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="p-8 bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all border border-teal-100 group hover:-translate-y-2"
            >
              <div className="text-4xl mb-6">🎯</div>
              <h3 className="text-2xl font-semibold mb-4 text-gray-800">Live Sessions</h3>
              <p className="text-gray-600 leading-relaxed">Create and manage interactive teaching sessions with real-time student engagement.</p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="p-8 bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all border border-teal-100 group hover:-translate-y-2"
            >
              <div className="text-4xl mb-6">📊</div>
              <h3 className="text-2xl font-semibold mb-4 text-gray-800">Analytics Dashboard</h3>
              <p className="text-gray-600 leading-relaxed">Track student engagement and performance with detailed analytics and insights.</p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="p-8 bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all border border-teal-100 group hover:-translate-y-2"
            >
              <div className="text-4xl mb-6">💡</div>
              <h3 className="text-2xl font-semibold mb-4 text-gray-800">Interactive Tools</h3>
              <p className="text-gray-600 leading-relaxed">Utilize whiteboards, polls, and quizzes to make learning more engaging.</p>
            </motion.div>
          </div>
        </div>

        {/* Request Demo Section */}
        <div className="py-24 relative z-10 bg-white/50 backdrop-blur-sm rounded-3xl my-12">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h2 className="text-4xl font-bold mb-8 bg-gradient-to-r from-teal-600 to-cyan-600 text-transparent bg-clip-text">
              See TeachStream in Action
            </h2>
            <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto">
              Schedule a personalized demo to discover how TeachStream can transform your teaching experience.
            </p>
            <Link 
              href="/request-demo" 
              className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white px-8 py-4 rounded-full hover:opacity-90 transition-all shadow-lg hover:shadow-teal-200 inline-block"
            >
              Request Demo
            </Link>
          </motion.div>
        </div>

        {/* Pricing Section */}
        <div className="py-24 relative z-10">
          <h2 className="text-4xl font-bold text-center mb-16 bg-gradient-to-r from-teal-600 to-cyan-600 text-transparent bg-clip-text">
            Simple, Transparent Pricing
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Basic Plan */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="p-8 bg-white rounded-2xl shadow-xl border border-teal-100 hover:shadow-2xl transition-all"
            >
              <h3 className="text-2xl font-bold mb-4">Basic</h3>
              <div className="text-4xl font-bold mb-6">$29<span className="text-lg text-gray-500">/mo</span></div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center"><span className="text-teal-500 mr-2">✓</span> Up to 30 students</li>
                <li className="flex items-center"><span className="text-teal-500 mr-2">✓</span> Basic analytics</li>
                <li className="flex items-center"><span className="text-teal-500 mr-2">✓</span> Live sessions</li>
              </ul>
              <Link 
                href="/signup?plan=basic" 
                className="block text-center bg-gradient-to-r from-teal-500 to-cyan-500 text-white px-6 py-3 rounded-full hover:opacity-90 transition-all"
              >
                Get Started
              </Link>
            </motion.div>

            {/* Pro Plan */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="p-8 bg-gradient-to-b from-teal-500 to-cyan-500 rounded-2xl shadow-xl border border-teal-400 hover:shadow-2xl transition-all transform scale-105"
            >
              <h3 className="text-2xl font-bold mb-4 text-white">Pro</h3>
              <div className="text-4xl font-bold mb-6 text-white">$79<span className="text-lg opacity-75">/mo</span></div>
              <ul className="space-y-4 mb-8 text-white">
                <li className="flex items-center"><span className="mr-2">✓</span> Up to 100 students</li>
                <li className="flex items-center"><span className="mr-2">✓</span> Advanced analytics</li>
                <li className="flex items-center"><span className="mr-2">✓</span> Interactive tools</li>
                <li className="flex items-center"><span className="mr-2">✓</span> Priority support</li>
              </ul>
              <Link 
                href="/signup?plan=pro" 
                className="block text-center bg-white text-teal-500 px-6 py-3 rounded-full hover:opacity-90 transition-all"
              >
                Get Started
              </Link>
            </motion.div>

            {/* Enterprise Plan */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="p-8 bg-white rounded-2xl shadow-xl border border-teal-100 hover:shadow-2xl transition-all"
            >
              <h3 className="text-2xl font-bold mb-4">Enterprise</h3>
              <div className="text-4xl font-bold mb-6">Custom</div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center"><span className="text-teal-500 mr-2">✓</span> Unlimited students</li>
                <li className="flex items-center"><span className="text-teal-500 mr-2">✓</span> Custom analytics</li>
                <li className="flex items-center"><span className="text-teal-500 mr-2">✓</span> API access</li>
                <li className="flex items-center"><span className="text-teal-500 mr-2">✓</span> Dedicated support</li>
              </ul>
              <Link 
                href="/contact-sales" 
                className="block text-center bg-gradient-to-r from-teal-500 to-cyan-500 text-white px-6 py-3 rounded-full hover:opacity-90 transition-all"
              >
                Contact Sales
              </Link>
            </motion.div>
          </div>
        </div>

        {/* Modern Footer */}
        <footer className="relative z-10 mt-24 border-t border-teal-100">
          <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
              <div className="space-y-8">
                <div className="text-2xl font-bold bg-gradient-to-r from-teal-500 to-cyan-500 text-transparent bg-clip-text">
                  TeachStream
                </div>
                <p className="text-gray-500">
                  Transforming online education through interactive and engaging teaching experiences.
                </p>
                <div className="flex space-x-6">
                  <a href="#" className="text-gray-400 hover:text-teal-500 transition-colors">
                    <span className="sr-only">Twitter</span>
                    <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                    </svg>
                  </a>
                </div>
              </div>

              <div>
                <h3 className="text-gray-900 font-semibold mb-4">Product</h3>
                <ul className="space-y-4">
                  <li>
                    <Link href="/features" className="text-gray-500 hover:text-teal-500 transition-colors">
                      Features
                    </Link>
                  </li>
                  <li>
                    <Link href="/pricing" className="text-gray-500 hover:text-teal-500 transition-colors">
                      Pricing
                    </Link>
                  </li>
                  <li>
                    <Link href="/roadmap" className="text-gray-500 hover:text-teal-500 transition-colors">
                      Roadmap
                    </Link>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-gray-900 font-semibold mb-4">Support</h3>
                <ul className="space-y-4">
                  <li>
                    <Link href="/documentation" className="text-gray-500 hover:text-teal-500 transition-colors">
                      Documentation
                    </Link>
                  </li>
                  <li>
                    <Link href="/guides" className="text-gray-500 hover:text-teal-500 transition-colors">
                      Guides
                    </Link>
                  </li>
                  <li>
                    <Link href="/help" className="text-gray-500 hover:text-teal-500 transition-colors">
                      Help Center
                    </Link>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-gray-900 font-semibold mb-4">Company</h3>
                <ul className="space-y-4">
                  <li>
                    <Link href="/about" className="text-gray-500 hover:text-teal-500 transition-colors">
                      About
                    </Link>
                  </li>
                  <li>
                    <Link href="/blog" className="text-gray-500 hover:text-teal-500 transition-colors">
                      Blog
                    </Link>
                  </li>
                  <li>
                    <Link href="/careers" className="text-gray-500 hover:text-teal-500 transition-colors">
                      Careers
                    </Link>
                  </li>
                </ul>
              </div>
            </div>

            <div className="mt-12 pt-8 border-t border-teal-100">
              <p className="text-center text-gray-500">
                © {new Date().getFullYear()} TeachStream. All rights reserved.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
