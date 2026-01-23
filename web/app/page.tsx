import { Button } from "../Components/ui/button"
import { ArrowRight, MapPin, DollarSign, Zap, Users } from "lucide-react"

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-slate-950/80 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="/images/wayfinderlogo.png" alt="WayFinder Logo" className="w-8 h-8" />
            <span className="text-xl font-bold text-white">WayFinder</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-slate-300 hover:text-white transition">
              Features
            </a>
            <a href="#how-it-works" className="text-slate-300 hover:text-white transition">
              How it Works
            </a>
            <a href="#team" className="text-slate-300 hover:text-white transition">
              Team
            </a>
          </div>
          {/* Get Started button removed */}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
        <div className="space-y-6 mb-12">
          <h1 className="text-5xl md:text-7xl font-bold text-white text-balance leading-tight">
            Find Your Perfect Route,
            <br />
            <span className="bg-gradient-to-r from-cyan-400 via-emerald-400 to-blue-400 bg-clip-text text-transparent">
              Compare Prices Instantly
            </span>
          </h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto text-balance">
            The smart commute planner that shows you all possible routes using different transport modes and their
            prices in real-time.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
          <Button
            size="lg"
            className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white border-0 text-lg h-12 px-8"
          >
            Download App
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </div>

        {/* Hero Image - App Screenshot Showcase */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 via-blue-500/20 to-emerald-500/20 blur-3xl -z-10 rounded-3xl"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-2xl overflow-hidden hover:border-cyan-500/50 transition">
              <img src="/images/homescreen.jpg" alt="Home Screen" className="w-full" />
              <div className="p-4 text-left">
                <h3 className="font-bold text-white mb-2">Smart Route Search</h3>
                <p className="text-sm text-slate-400">Enter your destination and instantly see all available routes</p>
              </div>
            </div>
            <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-2xl overflow-hidden hover:border-blue-500/50 transition">
              <img src="/images/MAP.jpg" alt="Price Comparison" className="w-full" />
              <div className="p-4 text-left">
                <h3 className="font-bold text-white mb-2">Price Comparison</h3>
                <p className="text-sm text-slate-400">Compare costs across buses, taxis, motos, and more</p>
              </div>
            </div>
            <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-2xl overflow-hidden hover:border-emerald-500/50 transition">
              <img src="/images/triphistory.jpg" alt="Trip History" className="w-full" />
              <div className="p-4 text-left">
                <h3 className="font-bold text-white mb-2">Trip Analytics</h3>
                <p className="text-sm text-slate-400">Track your trips and spending patterns over time</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section
        id="features"
        className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-transparent via-slate-900/50 to-transparent"
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">Why Choose WayFinder?</h2>
            <p className="text-slate-400 text-lg">Everything you need for smarter commuting</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: MapPin,
                title: "Real-Time Routes",
                description: "Access all available routes to your destination instantly",
              },
              {
                icon: DollarSign,
                title: "Price Transparency",
                description: "Compare costs across all transport modes upfront",
              },
              {
                icon: Zap,
                title: "AI-Powered Assistant",
                description: "Get personalized route suggestions based on your preferences",
              },
              {
                icon: Users,
                title: "Multiple Transport",
                description: "Choose from buses, taxis, motos, and more options",
              },
            ].map((feature, idx) => (
              <div
                key={idx}
                className="group p-6 bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl hover:border-cyan-500/50 transition hover:bg-slate-700/50"
              >
                <feature.icon className="w-10 h-10 text-cyan-400 mb-4 group-hover:scale-110 transition" />
                <h3 className="text-lg font-bold text-white mb-2">{feature.title}</h3>
                <p className="text-slate-400 text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">How It Works</h2>
            <p className="text-slate-400 text-lg">Three simple steps to find your route</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Choose Your Location",
                description: "Select your starting point and destination",
              },
              {
                step: "02",
                title: "View All Routes",
                description: "See all available routes with prices and travel times",
              },
              {
                step: "03",
                title: "Start Your Trip",
                description: "Select your preferred route and book instantly",
              },
            ].map((item, idx) => (
              <div key={idx} className="relative">
                {idx < 2 && (
                  <div className="hidden md:block absolute top-1/4 -right-4 w-8 h-1 bg-gradient-to-r from-cyan-400 to-transparent"></div>
                )}
                <div className="text-6xl font-bold text-cyan-500/20 mb-4">{item.step}</div>
                <h3 className="text-2xl font-bold text-white mb-2">{item.title}</h3>
                <p className="text-slate-400">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section
        id="team"
        className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-transparent via-slate-900/50 to-transparent"
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">Meet Our Team</h2>
            <p className="text-slate-400 text-lg">Passionate developers building the future of commuting</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="flex gap-8 flex-col">
              {[
                {
                  name: "Fanyi Charllson Fanyi",
                  role: "Lead Developer",
                  img: "/images/developer1.jpg",
                },
                {
                  name: "Lum Nchifor",
                  role: "Frontend Engineer",
                  img: "/images/developer2.jpg",
                },
              ].map((member, idx) => (
                <div key={idx} className="flex gap-4 items-center group">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl blur opacity-0 group-hover:opacity-100 transition"></div>
                    <img
                      src={member.img || "/placeholder.svg"}
                      alt={member.name}
                      className="w-24 h-24 rounded-xl object-cover relative"
                    />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">{member.name}</h3>
                    <p className="text-cyan-400">{member.role}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="space-y-4">
              <p className="text-slate-300 text-lg leading-relaxed">
                Our team combines expertise in transportation logistics, AI, and mobile development to create the most
                intuitive commute planning experience.
              </p>
              <p className="text-slate-400">
                With a shared vision of making urban commuting affordable and transparent, we're building tools that
                empower users to make smart travel decisions every day.
              </p>
              <Button className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white border-0 mt-4">
                Join Our Mission
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 backdrop-blur border border-cyan-500/30 rounded-2xl p-12">
            <h2 className="text-4xl font-bold text-white mb-4">Ready to Transform Your Commute?</h2>
            <p className="text-slate-300 text-lg mb-8">Download WayFinder today and start finding smarter routes.</p>
            <Button
              size="lg"
              className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white border-0 text-lg h-12 px-8"
            >
              Download Now
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
            <div>
              <h4 className="font-bold text-white mb-4">WayFinder</h4>
              <p className="text-slate-400 text-sm">Smart commute planning for urban life.</p>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li>
                  <a href="#" className="hover:text-white transition">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition">
                    Download
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition">
                    Pricing
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li>
                  <a href="#" className="hover:text-white transition">
                    About
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
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li>
                  <a href="#" className="hover:text-white transition">
                    Privacy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition">
                    Terms
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition">
                    Contact
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-slate-500 text-sm">© 2026 WayFinder. All rights reserved.</p>
            <div className="flex gap-6 mt-4 md:mt-0">
              <a href="#" className="text-slate-400 hover:text-white transition">
                Twitter
              </a>
              <a href="#" className="text-slate-400 hover:text-white transition">
                Facebook
              </a>
              <a href="#" className="text-slate-400 hover:text-white transition">
                Instagram
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
