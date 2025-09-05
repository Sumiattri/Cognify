import React from "react";
import {
  ArrowRight,
  BookOpen,
  Brain,
  FileText,
  Search,
  Sparkles,
  Users,
  Zap,
  MessageSquare,
  BarChart3,
  Shield,
  Globe,
  Play,
  Check,
} from "lucide-react";

import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { signInWithGoogle, logout } from "@/auth/auth";
import { auth } from "@/firebase/firebase";
import { onAuthStateChanged } from "firebase/auth";

function LandingPage() {
  const navigate = useNavigate();
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        navigate("/uploadpage");
      } else {
        setCheckingAuth(false);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    try {
      const user = await signInWithGoogle();
      console.log("Signed in as:", user.displayName);
      navigate("/uploadpage", { replace: true }); // redirect after successful login
    } catch (error) {
      alert("Sign in failed. Try again.");
    }
  };

  if (checkingAuth) return null;

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="border-b border-gray-100 sticky top-0 bg-white/90 backdrop-blur-md z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div
              onClick={() => {
                navigate("/");
              }}
              className="flex items-center space-x-2 cursor-pointer"
            >
              <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <span className="text-[28px]  text-black">Cognify</span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a
                href="#features"
                className="text-gray-600 hover:text-gray-900 hover:underline underline-offset-4  transition-colors"
              >
                Features
              </a>
              <a
                href="#works"
                className="text-gray-600 hover:text-gray-900 transition-colors hover:underline underline-offset-4"
              >
                {/* Pricing */}
                How Cognify Works
              </a>
              <a
                href="#help"
                className="text-gray-600 hover:text-gray-900 transition-colors hover:underline underline-offset-4"
              >
                Help
              </a>
              <button
                onClick={() => {
                  handleLogin();
                }}
                className="bg-black hover:scale-105 transition-all duration-300 text-white px-6 py-2.5 rounded-lg hover: cursor-pointer  font-medium"
              >
                Sign In
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-20 pb-32 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center space-x-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-8 border border-blue-100">
              <Sparkles className="w-4 h-4" />
              <span>Powered by advanced AI reasoning</span>
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-semibold text-gray-900 mb-8 leading-tight">
              Making Your Documents
              <br />
              <span className="bg-gradient-to-r from-[#6E87F8] to-[#25ed43] bg-clip-text text-transparent">
                Smarter
              </span>
            </h1>

            <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
              Upload your documents, ask questions, and let Cognify help you
              understand, analyze, and generate insights from your sources with
              the power of AI.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
              <button
                onClick={() => {
                  handleLogin();
                }}
                className="bg-black text-white px-8 py-4 rounded-lg text-lg font-medium hover:bg-white hover:text-black transition-all duration-200 hover:shadow-lg cursor-pointer hover:scale-105 flex items-center space-x-2"
              >
                <span>Sign in to get Started</span>
                <ArrowRight className="w-5 h-5" />
              </button>
              {/* <button className="border border-gray-300 cursor-pointer text-gray-700 px-8 py-4 rounded-lg text-lg font-medium hover:bg-gray-50 transition-colors flex items-center space-x-2">
                <Play className="w-5 h-5" />
                <span className="">Watch Demo</span>
              </button> */}
            </div>
          </div>

          {/* Hero Image/Demo */}
          <div className="relative max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
              <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex items-center space-x-2">
                <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                <div className="ml-4 text-sm text-gray-500">
                  Cognify - AI Research Assistant
                </div>
              </div>
              <div className="p-8">
                <div className="flex items-start space-x-4 mb-6">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <MessageSquare className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <div className="bg-gray-100 rounded-lg p-3 mb-2">
                      <p className="text-gray-800">
                        What are the main findings from my research papers on
                        climate change?
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                    <Brain className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                      <p className="text-gray-800 mb-3">
                        Based on your uploaded research papers, here are the
                        main findings on climate change:
                      </p>
                      <ul className="space-y-1 text-gray-700">
                        <li>
                          • Global temperatures have increased by 1.1°C since
                          pre-industrial times
                        </li>
                        <li>
                          • Arctic ice loss has accelerated significantly in the
                          past decade
                        </li>
                        <li>
                          • Renewable energy adoption is crucial for limiting
                          warming to 1.5°C
                        </li>
                      </ul>
                      <div className="mt-3 text-xs text-gray-500">
                        Sources: Climate_Report_2024.pdf, IPCC_Summary.pdf
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
              Supercharge your research workflow
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              From upload to insights in minutes. Cognify transforms how you
              work with documents and research.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
            {/* Feature 1 */}
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-lg hover:border-gray-200 transition-all duration-300">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-6">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Smart Document Analysis
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Upload PDFs, articles, and research papers. Cognify
                automatically extracts key insights and creates searchable
                summaries.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-lg hover:border-gray-200 transition-all duration-300">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-6">
                <MessageSquare className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Ask Anything
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Chat with your documents using natural language. Get instant
                answers backed by citations from your sources.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-lg hover:border-gray-200 transition-all duration-300">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-6">
                <BookOpen className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Generate Summaries
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Create comprehensive study guides, executive summaries, and
                research briefs from your document collection.
              </p>
            </div>

            {/* Feature 4 */}
            {/* <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-lg hover:border-gray-200 transition-all duration-300">
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mb-6">
                <BarChart3 className="w-6 h-6 text-orange-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Visual Insights
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Transform complex data into clear visualizations and interactive
                charts to better understand your research.
              </p>
            </div> */}

            {/* Feature 5 */}
            {/* <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-lg hover:border-gray-200 transition-all duration-300">
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center mb-6">
                <Users className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Team Collaboration
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Share notebooks, collaborate on research projects, and maintain
                a centralized knowledge base for your team.
              </p>
            </div> */}

            {/* Feature 6 */}
            {/* <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-lg hover:border-gray-200 transition-all duration-300">
              <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center mb-6">
                <Shield className="w-6 h-6 text-indigo-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Secure & Private
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Your documents and research remain private and secure with
                enterprise-grade security and data protection.
              </p>
            </div> */}
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section id="works" className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
              How Cognify works
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Get started with your AI research assistant in three simple steps
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-12">
            {/* Step 1 */}
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-2xl flex items-center justify-center mx-auto mb-6 text-2xl font-bold">
                1
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                Upload Documents
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Simply drag and drop your PDFs, research papers, articles, and
                notes into Cognify. We support all major document formats.
              </p>
            </div>

            {/* Step 2 */}
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-600 text-white rounded-2xl flex items-center justify-center mx-auto mb-6 text-2xl font-bold">
                2
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                Ask Questions
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Chat with your documents using natural language. Ask complex
                questions and get detailed answers with source citations.
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-center">
              <div className="w-16 h-16 bg-green-600 text-white rounded-2xl flex items-center justify-center mx-auto mb-6 text-2xl font-bold">
                3
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                Get Insights
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Receive comprehensive summaries, generate new content, and
                discover connections across your research materials.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      {/* <section id="pricing" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
              Choose your plan
            </h2>
            <p className="text-xl text-gray-600">
              Start free, scale as you grow
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
           
            <div className="bg-white rounded-2xl border-2 border-gray-200 p-8">
              <h3 className="text-2xl font-semibold text-gray-900 mb-2">
                Free
              </h3>
              <p className="text-gray-600 mb-6">Perfect for getting started</p>
              <div className="mb-8">
                <span className="text-4xl font-bold text-gray-900">$0</span>
                <span className="text-gray-600">/month</span>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-green-500" />
                  <span className="text-gray-700">5 documents per month</span>
                </li>
                <li className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-green-500" />
                  <span className="text-gray-700">Basic AI chat</span>
                </li>
                <li className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-green-500" />
                  <span className="text-gray-700">Document summaries</span>
                </li>
              </ul>
              <button className="w-full bg-gray-100 text-gray-900 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors">
                Get Started
              </button>
            </div>

          
            <div className="bg-white rounded-2xl border-2 border-blue-500 p-8 relative">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                  Most Popular
                </span>
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-2">Pro</h3>
              <p className="text-gray-600 mb-6">For serious researchers</p>
              <div className="mb-8">
                <span className="text-4xl font-bold text-gray-900">$20</span>
                <span className="text-gray-600">/month</span>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-green-500" />
                  <span className="text-gray-700">Unlimited documents</span>
                </li>
                <li className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-green-500" />
                  <span className="text-gray-700">Advanced AI reasoning</span>
                </li>
                <li className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-green-500" />
                  <span className="text-gray-700">Team collaboration</span>
                </li>
                <li className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-green-500" />
                  <span className="text-gray-700">Priority support</span>
                </li>
              </ul>
              <button className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors">
                Start Pro Trial
              </button>
            </div>

           
            <div className="bg-white rounded-2xl border-2 border-gray-200 p-8">
              <h3 className="text-2xl font-semibold text-gray-900 mb-2">
                Enterprise
              </h3>
              <p className="text-gray-600 mb-6">For large organizations</p>
              <div className="mb-8">
                <span className="text-4xl font-bold text-gray-900">Custom</span>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-green-500" />
                  <span className="text-gray-700">Everything in Pro</span>
                </li>
                <li className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-green-500" />
                  <span className="text-gray-700">Custom integrations</span>
                </li>
                <li className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-green-500" />
                  <span className="text-gray-700">Dedicated support</span>
                </li>
                <li className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-green-500" />
                  <span className="text-gray-700">Advanced security</span>
                </li>
              </ul>
              <button className="w-full bg-gray-900 text-white py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors">
                Contact Sales
              </button>
            </div>
          </div>
        </div>
      </section> */}

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
            Ready to transform your research?
          </h2>
          <p className="text-xl text-blue-100 mb-10 leading-relaxed">
            Join thousands of researchers, students, and professionals who are
            already using Cognify to accelerate their work.
          </p>
          <button
            onClick={() => {
              handleLogin();
            }}
            className="bg-white cursor-pointer text-blue-600 px-8 py-4 rounded-lg text-lg font-medium hover:bg-gray-100 transition-all duration-200 hover:shadow-lg hover:scale-105 inline-flex items-center space-x-2"
          >
            {/* <span>Start Your Free Trial</span> */}
            <span>Sign in to get started</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
                  <Brain className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-semibold">Cognify</span>
              </div>
              <p className="text-gray-400 mb-6 max-w-md">
                Your AI research assistant that helps you understand, analyze,
                and generate insights from your documents.
              </p>
              <div className="flex space-x-4">
                <Globe className="w-5 h-5 text-gray-400 hover:text-white cursor-pointer transition-colors" />
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Pricing
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Security
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Enterprise
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Help Center
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Contact Us
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Terms of Service
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; 2025 Cognify. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;
