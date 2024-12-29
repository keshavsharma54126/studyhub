'use client';

import { motion, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import { BackgroundBeams } from "@repo/ui/background-beams";
import { TypewriterEffect } from "@repo/ui/typewriter-effect.tsx";
import { useRef } from "react";
import { ThemeToggle } from "@repo/ui/themetoggle";
import { GeistMono } from 'geist/font/mono';
import { FloatingLines } from "@repo/ui/floating-lines";
export default function Home() {
  const targetRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start start", "end start"],
  });

  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.8]);
  const position = useTransform(scrollYProgress, (pos) => {
    return pos === 1 ? "relative" : "fixed";
  });

  const words = [
    {
      text: "Transform",
    },
    {
      text: "your",
    },
    {
      text: "teaching",
    },
    {
      text:"and"
    }
    
  ];
  const words2 = [
    {
      text:"learning",
    },
    {
      text: "experience.",
      className: "text-teal-500 dark:text-cyan-400",
    },
  ];

  return (
    <div className={`min-h-screen bg-[conic-gradient(at_bottom_left,_var(--tw-gradient-stops))] from-black via-gray-950 to-gray-900 ${GeistMono.className}`}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Navigation */}
        <nav className="fixed top-0 left-0 right-0 bg-black/50 backdrop-blur-md z-50 border-b border-gray-800">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="text-xl sm:text-2xl font-light tracking-tight text-white hover:text-teal-500 transition-colors cursor-pointer">
                TeachStream
              </div>
              <button className="md:hidden p-2 text-white">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <div className="hidden md:flex items-center space-x-4 lg:space-x-8">
                <ThemeToggle />
                <Link href="/features" className="text-gray-400 hover:text-teal-500 transition-colors">
                  Features
                </Link>
                <Link href="/pricing" className="text-gray-400 hover:text-teal-500 transition-colors">
                  Pricing
                </Link>
                <div className="relative group">
                  <div className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white px-6 py-2 rounded-xl flex items-center space-x-2 hover:from-teal-600 hover:to-cyan-600 transition-all duration-200">
                    <Link href="/signin" className="hover:text-white/90 transition-colors">
                      Sign in
                    </Link>
                    <span className="text-white/60">/</span>
                    <Link href="/signup" className="hover:text-white/90 transition-colors">
                      Sign up
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </nav>

        {/* Rest of the sections */}
        <div ref={targetRef} className="relative min-h-screen w-full">
          <motion.div 
            style={{ opacity, scale, position }}
            className="relative min-h-screen flex flex-col items-center justify-center py-16 md:py-32"
          >
            <FloatingLines />
            
            {/* Keep existing content but update styling to match dark theme */}
            <div className="text-center relative z-10 max-w-5xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1 }}
                className="space-y-8"
              >
                {/* Update icon container styling */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ 
                    type: "spring",
                    stiffness: 260,
                    damping: 20,
                    delay: 0.2 
                  }}
                  className="mx-auto mb-8"
                >
                  <div className="w-20 h-20 mx-auto bg-gradient-to-r from-teal-500 to-cyan-500 rounded-xl flex items-center justify-center">
                    <svg 
                      className="w-10 h-10 text-white" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" 
                      />
                    </svg>
                  </div>
                </motion.div>

                {/* Keep TypewriterEffect components */}
                <div className="flex flex-col items-center justify-center px-10 text-white">
                  <TypewriterEffect words={words} className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight" />
                  <TypewriterEffect words={words2} className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight" />
                </div>

                {/* Update paragraph text color */}
                <motion.p 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="text-base sm:text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mt-6 sm:mt-8 leading-relaxed px-4"
                >
                  Create engaging, interactive teaching sessions and connect with your students in real-time through our 
                  <motion.span className="text-teal-500 font-medium"> innovative AI-powered platform</motion.span>
                </motion.p>

                {/* Update CTA buttons */}
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                  className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8 sm:mt-12 px-4"
                >
                  <Link 
                    href="/create-session" 
                    className="w-full sm:w-auto bg-gradient-to-r from-teal-500 to-cyan-500 text-white px-8 py-4 rounded-xl 
                      hover:from-teal-600 hover:to-cyan-600 transition-all duration-200 transform hover:scale-105
                      flex items-center justify-center space-x-2 group"
                  >
                    <span>Get Started Free</span>
                    <svg 
                      className="w-5 h-5 group-hover:translate-x-1 transition-transform" 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </Link>
                  
                  <Link 
                    href="/demo" 
                    className="w-full sm:w-auto group px-8 py-4 rounded-xl border border-gray-800 hover:border-teal-500/50 
                      transition-all duration-200 flex items-center justify-center space-x-2 text-gray-400 hover:text-teal-500
                      bg-black/50 backdrop-blur-sm"
                  >
                    <svg 
                      className="w-5 h-5" 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Watch Demo</span>
                  </Link>
                </motion.div>

                {/* Update stats section */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1 }}
                  className="mt-12 pt-8 border-t border-gray-800 flex flex-col sm:flex-row items-center justify-center gap-8 text-sm text-gray-400"
                >
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <span>4.9/5 from 2,000+ reviews</span>
                  </div>
                  <div>Trusted by 500+ educational institutions</div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                    <span>99.9% Uptime</span>
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </motion.div>
        </div>

        {/* Features Section */}
        <div className="py-24 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 text-white">Why TeachStream?</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Discover how our platform revolutionizes online teaching
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8 lg:gap-12 px-4">
            {[
              {
                title: "Real-time Interaction",
                description: "Engage with students instantly through live sessions with interactive tools and features.",
                icon: "🔄"
              },
              {
                title: "Smart Analytics",
                description: "Track student engagement and progress with detailed insights and reports.",
                icon: "📊"
              },
              {
                title: "Easy Integration",
                description: "Seamlessly integrate with your existing teaching tools and platforms.",
                icon: "🔌"
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2 }}
                className="p-6 rounded-2xl bg-black/40 backdrop-blur-sm border border-gray-800 hover:border-teal-500/50 transition-all duration-200"
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-2 text-white">{feature.title}</h3>
                <p className="text-gray-400">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* New Demo Request Section */}
        <div className="py-24 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="bg-black/40 backdrop-blur-sm rounded-3xl p-6 sm:p-8 md:p-12 mx-4 border border-gray-800"
          >
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6 text-white">See TeachStream in Action</h2>
              <p className="text-lg sm:text-xl mb-6 sm:mb-8 text-gray-400">
                Schedule a personalized demo with our team and discover how TeachStream can transform your teaching experience.
              </p>
              <form className="flex flex-col sm:flex-row gap-4 justify-center">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-black/50 border border-gray-800 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white px-8 py-3 rounded-xl hover:from-teal-600 hover:to-cyan-600 transition-all duration-200"
                >
                  Request Demo
                </motion.button>
              </form>
            </div>
          </motion.div>
        </div>

        {/* New Pricing Section */}
        <div className="py-24 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 text-white">Simple, Transparent Pricing</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">Choose the perfect plan for your teaching needs</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 px-4">
            {[
              {
                name: "Starter",
                price: "$29",
                features: ["Up to 30 students", "Basic analytics", "Live sessions", "Chat support"],
                highlighted: false
              },
              {
                name: "Professional",
                price: "$79",
                features: ["Up to 100 students", "Advanced analytics", "Recording & playback", "Priority support"],
                highlighted: true
              },
              {
                name: "Enterprise",
                price: "Custom",
                features: ["Unlimited students", "Custom features", "API access", "Dedicated support"],
                highlighted: false
              }
            ].map((plan, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2 }}
                className={`p-8 rounded-2xl ${
                  plan.highlighted
                    ? "bg-gradient-to-b from-teal-500 to-cyan-500 text-white"
                    : "bg-black/40 backdrop-blur-sm border border-gray-800 hover:border-teal-500/50"
                }`}
              >
                <h3 className="text-2xl font-bold mb-2 text-white">{plan.name}</h3>
                <div className="text-3xl font-bold mb-6 text-white">{plan.price}<span className="text-sm font-normal text-gray-400">/month</span></div>
                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center text-gray-300">
                      <span className="mr-2 text-teal-500">✓</span> {feature}
                    </li>
                  ))}
                </ul>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`w-full py-3 rounded-xl transition-all duration-200 ${
                    plan.highlighted
                      ? "bg-white text-teal-500 hover:bg-opacity-90"
                      : "bg-gradient-to-r from-teal-500 to-cyan-500 text-white hover:from-teal-600 hover:to-cyan-600"
                  }`}
                >
                  Get Started
                </motion.button>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Updated CTA Section */}
        <div className="py-24 relative z-10">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="bg-black/40 backdrop-blur-sm rounded-3xl p-6 sm:p-8 md:p-12 mx-4 text-center border border-gray-800"
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 text-white">Ready to transform your teaching?</h2>
            <p className="text-gray-400 max-w-2xl mx-auto mb-6 sm:mb-8 text-base sm:text-lg">
              Join thousands of educators who are already using TeachStream to create engaging learning experiences.
            </p>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white px-8 py-4 rounded-xl hover:from-teal-600 hover:to-cyan-600 transition-all duration-200"
            >
              Start Teaching Today
            </motion.button>
          </motion.div>
        </div>

      </div>
    </div>
  );
}


