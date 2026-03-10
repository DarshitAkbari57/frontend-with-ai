"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Calendar,
  Users,
  Heart,
  MapPin,
  Activity,
  Star,
  Clock,
  ArrowRight,
  Sparkles,
  TrendingUp,
  Zap,
  Music,
  Palette,
  Lightbulb,
} from "lucide-react";
import Link from "next/link";

const mockExperiences = [
  {
    id: 30,
    title: "Nebula Music Festival",
    description:
      "Experience the ultimate electronic music festival with top DJs and immersive visuals.",
    likeCount: 1240,
    commentCount: 89,
    experienceStartDateTime: "2026-02-27T02:01:38.038Z",
    location: "135 W 41st St, New York, NY",
    category: "Music",
    color: { background_colour: "#00C853", button_bg_colour: "#001f2d" },
    expPicture: {
      media:
        "https://media.istockphoto.com/id/1806011581/photo/overjoyed-happy-young-people-dancing-jumping-and-singing-during-concert-of-favorite-group.jpg?s=612x612&w=0&k=20&c=cMFdhX403-yKneupEN-VWSfFdy6UWf1H0zqo6QBChP4=",
    },
    userDetail: {
      userName: "NebulaLive",
      profilePicture: {
        media:
          "https://media.istockphoto.com/id/1806011581/photo/overjoyed-happy-young-people-dancing-jumping-and-singing-during-concert-of-favorite-group.jpg?s=612x612&w=0&k=20&c=cMFdhX403-yKneupEN-VWSfFdy6UWf1H0zqo6QBChP4=",
      },
    },
  },
  {
    id: 31,
    title: "Oracle Tech Summit",
    description:
      "Deep dive into the future of cloud computing, AI, and enterprise architecture.",
    likeCount: 856,
    commentCount: 42,
    experienceStartDateTime: "2026-03-15T09:00:00.000Z",
    location: "Moscone Center, San Francisco, CA",
    category: "Learning",
    color: { background_colour: "#00C853", button_bg_colour: "#001f2d" },
    expPicture: {
      media:
        "https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=1000&auto=format&fit=crop",
    },
    userDetail: {
      userName: "OracleEvents",
      profilePicture: {
        media:
          "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop",
      },
    },
  },
  {
    id: 32,
    title: "Artisan Coffee Masterclass",
    description:
      "Learn the secrets of brewing the perfect cup of coffee from world-renowned baristas.",
    likeCount: 520,
    commentCount: 28,
    experienceStartDateTime: "2026-04-10T10:00:00.000Z",
    location: "The Roastery, Seattle, WA",
    category: "Lifestyle",
    color: { background_colour: "#FF9800", button_bg_colour: "#3E2723" },
    expPicture: {
      media:
        "https://images.unsplash.com/photo-1497935586351-b67a49e012bf?q=80&w=1000&auto=format&fit=crop",
    },
    userDetail: {
      userName: "SeattleBrewers",
      profilePicture: {
        media:
          "https://images.unsplash.com/photo-1544725176-7c40e5a71c5e?w=100&h=100&fit=crop",
      },
    },
  },
];

const mockActivities = [
  {
    id: 1,
    activityName: "VIP Backstage Tour",
    description: "Exclusive access behind the scenes before the main event.",
    activityStartDateTime: "2026-02-27T18:00:00.000Z",
    activityCost: 150,
    activityLocation: "Main Stage Left",
    isOnline: false,
    activityPicture: {
      media:
        "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=1000&auto=format&fit=crop",
    },
  },
  {
    id: 2,
    activityName: "Cloud Architecture Workshop",
    description: "Hands-on session with top engineers.",
    activityStartDateTime: "2026-03-15T11:00:00.000Z",
    activityCost: 0,
    activityLocation: "Room 3B",
    isOnline: true,
    activityPicture: {
      media:
        "https://images.unsplash.com/photo-1531482615713-2afd69097998?q=80&w=1000&auto=format&fit=crop",
    },
  },
  {
    id: 3,
    activityName: "Afterparty Celebration",
    description: "Unwind and network with fellow attendees.",
    activityStartDateTime: "2026-02-28T02:00:00.000Z",
    activityCost: 50,
    activityLocation: "Rooftop Lounge",
    isOnline: false,
    activityPicture: {
      media:
        "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=1000&auto=format&fit=crop",
    },
  },
];

// Helper to format dates consistently on server and client
function formatDateOnly(dateString: string): string {
  const date = new Date(dateString);
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  return `${months[date.getUTCMonth()]} ${date.getUTCDate()}`;
}

function ParallaxText({
  children,
  offset = 0,
}: {
  children: React.ReactNode;
  offset?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [yPos, setYPos] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      if (ref.current) {
        const scrollY = window.scrollY;
        const elementPos = ref.current.getBoundingClientRect().top;
        const windowHeight = window.innerHeight;

        if (elementPos < windowHeight && elementPos > -windowHeight) {
          setYPos((scrollY - (ref.current.offsetTop - windowHeight)) * 0.5);
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div
      ref={ref}
      style={{ transform: `translateY(${yPos * offset}px)` }}
      className="transition-transform duration-100"
    >
      {children}
    </div>
  );
}

function ScrollReveal({
  children,
  delay = 0,
}: {
  children: React.ReactNode;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (ref.current) {
        const elementTop = ref.current.getBoundingClientRect().top;
        const windowHeight = window.innerHeight;
        if (elementTop < windowHeight * 0.8) {
          setTimeout(() => setIsVisible(true), delay);
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [delay]);

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
      }`}
    >
      {children}
    </div>
  );
}

export default function LandingPage() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const featuredExperience = mockExperiences[0];

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 font-sans selection:bg-cyan-500/30 overflow-x-hidden">
      <style jsx global>{`
        @keyframes cinematic-slide {
          0% {
            opacity: 0;
            transform: translateY(60px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes shimmer {
          0%,
          100% {
            opacity: 0.5;
          }
          50% {
            opacity: 1;
          }
        }

        @keyframes float-soft {
          0%,
          100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-12px);
          }
        }

        @keyframes glow-pulse {
          0%,
          100% {
            box-shadow: 0 0 20px rgba(34, 211, 238, 0.3);
          }
          50% {
            box-shadow: 0 0 40px rgba(34, 211, 238, 0.6);
          }
        }

        @keyframes reveal-line {
          0% {
            width: 0;
          }
          100% {
            width: 100%;
          }
        }

        .animate-cinematic {
          animation: cinematic-slide 0.8s ease-out;
        }
        .animate-shimmer {
          animation: shimmer 3s ease-in-out infinite;
        }
        .animate-float-soft {
          animation: float-soft 4s ease-in-out infinite;
        }
        .glow-pulse {
          animation: glow-pulse 3s ease-in-out infinite;
        }

        html {
          scroll-behavior: smooth;
        }

        .parallax-container {
          perspective: 1000px;
        }

        /* Custom scrollbar */
        ::-webkit-scrollbar {
          width: 8px;
        }
        ::-webkit-scrollbar-track {
          background: rgba(15, 23, 42, 0.5);
        }
        ::-webkit-scrollbar-thumb {
          background: linear-gradient(180deg, #06b6d4, #3b82f6);
          border-radius: 4px;
        }
      `}</style>

      {/* Navbar */}
      <header
        className={`fixed top-0 z-50 w-full transition-all duration-500 ${
          isScrolled
            ? "bg-slate-950/90 backdrop-blur-xl border-b border-cyan-500/20 shadow-2xl"
            : "bg-transparent"
        }`}
      >
        <div className="flex items-center justify-between h-20 px-4 md:px-8 max-w-7xl mx-auto w-full">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-xl flex items-center justify-center group">
              <Sparkles
                size={20}
                className="text-white group-hover:rotate-12 transition-transform"
              />
            </div>
            <span className="font-black text-2xl tracking-tighter text-white">
              Experienz
            </span>
          </div>
          <div className="flex items-center gap-3 md:gap-6">
            <Link
              href="/login"
              className="text-sm font-semibold text-slate-300 hover:text-cyan-400 transition-colors duration-200"
            >
              Sign In
            </Link>
            <button className="text-sm font-bold bg-gradient-to-r from-cyan-500 to-blue-500 hover:shadow-2xl hover:shadow-cyan-500/50 text-white px-6 py-2.5 rounded-lg transition-all duration-300 transform hover:scale-110 hover:-translate-y-1">
              Explore
            </button>
          </div>
        </div>
      </header>

      {/* HERO SECTION - Cinematic */}
      <section className="relative min-h-screen w-full flex items-center justify-center overflow-hidden pt-20">
        {/* Dynamic background with parallax */}
        <ParallaxText offset={-0.3}>
          <div className="absolute inset-0 w-full h-full">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=2000&q=80"
              alt="Hero background"
              className="w-full h-full object-cover opacity-15 scale-110"
            />
          </div>
        </ParallaxText>

        {/* Animated gradient orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-96 h-96 bg-cyan-500 rounded-full blur-3xl opacity-20 animate-shimmer"></div>
          <div
            className="absolute bottom-20 right-10 w-80 h-80 bg-blue-500 rounded-full blur-3xl opacity-15 animate-shimmer"
            style={{ animationDelay: "1s" }}
          ></div>
          <div
            className="absolute top-1/2 left-1/3 w-72 h-72 bg-purple-500 rounded-full blur-3xl opacity-10 animate-shimmer"
            style={{ animationDelay: "2s" }}
          ></div>
        </div>

        {/* Hero content */}
        <div className="relative z-10 max-w-6xl mx-auto px-4 md:px-8 text-center">
          <div className="space-y-8 animate-cinematic">
            {/* Subtitle line */}
            <div className="flex justify-center">
              <div className="h-1 w-16 bg-gradient-to-r from-transparent via-cyan-500 to-transparent"></div>
            </div>

            {/* Main heading */}
            <h1 className="text-6xl sm:text-7xl md:text-8xl font-black leading-[1.1] tracking-tighter text-white">
              Life Happens In
              <br />
              <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-500 bg-clip-text text-transparent animate-shimmer">
                Moments
              </span>
            </h1>

            {/* Descriptive text */}
            <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed font-light">
              Discover unforgettable experiences happening around you. From
              electrifying concerts to intimate masterclasses—find your next
              adventure.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
              <button className="px-10 py-4 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-black text-lg rounded-xl hover:shadow-2xl hover:shadow-cyan-500/50 transition-all duration-300 transform hover:scale-110 hover:-translate-y-1 group flex items-center gap-3">
                Discover Now
                <ArrowRight
                  size={20}
                  className="group-hover:translate-x-2 transition-transform"
                />
              </button>
              <button className="px-10 py-4 border-2 border-slate-600 hover:border-cyan-500 text-white font-semibold rounded-xl transition-all duration-300 hover:bg-cyan-500/10">
                Learn More
              </button>
            </div>

            {/* Floating stats */}
            <div className="grid grid-cols-3 gap-6 pt-16 max-w-2xl mx-auto">
              <div className="text-center">
                <div className="text-4xl font-black text-cyan-400">150K+</div>
                <div className="text-sm text-slate-400 mt-2">Events</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-black text-blue-400">2M+</div>
                <div className="text-sm text-slate-400 mt-2">Explorers</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-black text-purple-400">50K+</div>
                <div className="text-sm text-slate-400 mt-2">Creators</div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20">
          <div className="flex flex-col items-center gap-3 animate-float-soft">
            <p className="text-xs text-slate-500 font-semibold uppercase tracking-widest">
              Scroll to explore
            </p>
            <div className="w-6 h-10 border-2 border-slate-600 rounded-full flex justify-center p-2">
              <div className="w-1 h-2 bg-cyan-500 rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURED STORY SECTION */}
      <section className="relative py-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            {/* Text content with reveal animation */}
            <ScrollReveal delay={0}>
              <div className="space-y-6">
                <div className="inline-block">
                  <span className="text-sm font-black uppercase tracking-widest text-cyan-400">
                    Featured Experience
                  </span>
                  <div className="h-1 w-12 bg-gradient-to-r from-cyan-500 to-blue-500 mt-2"></div>
                </div>

                <h2 className="text-5xl md:text-6xl font-black leading-tight text-white">
                  {featuredExperience.title}
                </h2>

                <p className="text-lg text-slate-300 leading-relaxed max-w-lg">
                  {featuredExperience.description}
                </p>

                {/* Info grid */}
                <div className="grid grid-cols-2 gap-4 pt-6">
                  <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/60 rounded-xl p-4 group hover:border-cyan-500/60 transition-all duration-300">
                    <div className="flex items-center gap-3 mb-2">
                      <Calendar size={18} className="text-cyan-400" />
                      <span className="text-xs text-slate-400 uppercase font-semibold">
                        When
                      </span>
                    </div>
                    <p className="font-bold text-white">
                      {formatDateOnly(
                        featuredExperience.experienceStartDateTime,
                      )}
                    </p>
                  </div>
                  <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/60 rounded-xl p-4 group hover:border-cyan-500/60 transition-all duration-300">
                    <div className="flex items-center gap-3 mb-2">
                      <MapPin size={18} className="text-cyan-400" />
                      <span className="text-xs text-slate-400 uppercase font-semibold">
                        Where
                      </span>
                    </div>
                    <p className="font-bold text-white line-clamp-1">
                      {featuredExperience.location}
                    </p>
                  </div>
                </div>

                {/* CTA */}
                <div className="pt-4">
                  <button className="w-full sm:w-auto px-10 py-4 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-black rounded-xl hover:shadow-2xl hover:shadow-cyan-500/50 transition-all duration-300 transform hover:scale-105 group flex items-center justify-center gap-3">
                    Get Tickets
                    <ArrowRight
                      size={18}
                      className="group-hover:translate-x-2 transition-transform"
                    />
                  </button>
                </div>
              </div>
            </ScrollReveal>

            {/* Image with hover parallax */}
            <ScrollReveal delay={100}>
              <div className="relative group cursor-pointer">
                <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-3xl blur-2xl opacity-30 group-hover:opacity-60 transition-all duration-500"></div>
                <div className="relative rounded-3xl overflow-hidden bg-slate-900">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={featuredExperience.expPicture.media}
                    alt={featuredExperience.title}
                    className="w-full h-96 object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-40"></div>
                </div>

                {/* Floating badge */}
                <div className="absolute -bottom-6 -right-6 bg-slate-950 border-2 border-cyan-500/50 rounded-2xl p-6 backdrop-blur-sm group-hover:scale-110 transition-transform duration-300">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-full flex items-center justify-center">
                      <Heart size={20} className="text-white fill-white" />
                    </div>
                    <div>
                      <p className="text-2xl font-black text-white">
                        {(featuredExperience.likeCount / 1000).toFixed(1)}K
                      </p>
                      <p className="text-xs text-slate-400">Going</p>
                    </div>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* CATEGORIES SECTION */}
      <section className="relative py-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <ScrollReveal>
            <div className="text-center mb-16">
              <span className="text-sm font-black uppercase tracking-widest text-cyan-400">
                Browse by vibe
              </span>
              <h2 className="text-5xl md:text-6xl font-black mt-4 text-white leading-tight">
                Find Your Kind of Magic
              </h2>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: Music,
                title: "Concerts & Music",
                count: "2,450 events",
                color: "from-red-500 to-pink-500",
              },
              {
                icon: Palette,
                title: "Arts & Culture",
                count: "1,820 events",
                color: "from-purple-500 to-pink-500",
              },
              {
                icon: Lightbulb,
                title: "Learning & Growth",
                count: "3,120 events",
                color: "from-cyan-500 to-blue-500",
              },
            ].map((category, idx) => {
              const Icon = category.icon;
              return (
                <ScrollReveal key={idx} delay={idx * 100}>
                  <div className="group relative bg-slate-800/30 backdrop-blur-sm border border-slate-700/60 rounded-2xl p-8 cursor-pointer overflow-hidden transition-all duration-300 hover:border-cyan-500/60 hover:-translate-y-2">
                    <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative z-10">
                      <div
                        className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${category.color} p-4 mb-6 group-hover:scale-110 transition-transform`}
                      >
                        <Icon size={32} className="text-white" />
                      </div>
                      <h3 className="text-2xl font-black text-white mb-2">
                        {category.title}
                      </h3>
                      <p className="text-slate-400">{category.count}</p>
                    </div>
                  </div>
                </ScrollReveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* TRENDING MOMENTS SECTION */}
      <section className="relative py-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <ScrollReveal>
            <div className="text-center mb-16">
              <span className="text-sm font-black uppercase tracking-widest text-cyan-400">
                What's hot
              </span>
              <h2 className="text-5xl md:text-6xl font-black mt-4 text-white leading-tight">
                Trending Moments Right Now
              </h2>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockExperiences.map((exp, idx) => (
              <ScrollReveal key={exp.id} delay={idx * 100}>
                <div className="group relative bg-slate-800/30 backdrop-blur-sm border border-slate-700/60 rounded-2xl overflow-hidden transition-all duration-300 hover:border-cyan-500/60 hover:-translate-y-2 flex flex-col h-full">
                  {/* Image container */}
                  <div className="relative h-64 overflow-hidden bg-slate-900">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={exp.expPicture.media}
                      alt={exp.title}
                      className="w-full h-full object-cover group-hover:scale-125 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 to-transparent opacity-60 group-hover:opacity-80 transition-opacity"></div>

                    {/* Date badge */}
                    <div className="absolute top-4 right-4 bg-gradient-to-r from-cyan-500 to-blue-500 px-4 py-2 rounded-lg">
                      <p className="text-xs font-black text-white">
                        {formatDateOnly(exp.experienceStartDateTime)}
                      </p>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6 space-y-4 flex-1 flex flex-col">
                    <h3 className="text-xl font-black text-white group-hover:text-cyan-400 transition-colors line-clamp-2">
                      {exp.title}
                    </h3>

                    <p className="text-sm text-slate-400 line-clamp-2 flex-1">
                      {exp.description}
                    </p>

                    {/* Location */}
                    <div className="flex items-center gap-2 text-sm text-slate-400 pt-2 border-t border-slate-700/60">
                      <MapPin size={16} className="text-cyan-500 shrink-0" />
                      <span className="line-clamp-1">{exp.location}</span>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="px-6 pb-6 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={exp.userDetail.profilePicture.media}
                        alt="Host"
                        className="w-6 h-6 rounded-full object-cover border border-cyan-500/30"
                      />
                      <p className="text-xs text-slate-400 font-semibold">
                        {exp.userDetail.userName}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 text-slate-400">
                      <Heart
                        size={14}
                        className="fill-rose-500 text-rose-500"
                      />
                      <p className="text-xs font-semibold">
                        {(exp.likeCount / 1000).toFixed(1)}K
                      </p>
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ADD-ON ACTIVITIES SECTION */}
      <section className="relative py-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <ScrollReveal>
            <div className="text-center mb-16">
              <span className="text-sm font-black uppercase tracking-widest text-cyan-400">
                Enhance Your Experience
              </span>
              <h2 className="text-5xl md:text-6xl font-black mt-4 text-white leading-tight">
                Premium Add-Ons
              </h2>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockActivities.map((act, idx) => (
              <ScrollReveal key={act.id} delay={idx * 100}>
                <div className="group relative bg-slate-800/30 backdrop-blur-sm border border-slate-700/60 rounded-2xl overflow-hidden transition-all duration-300 hover:border-purple-500/60 hover:-translate-y-2 flex flex-col h-full">
                  {/* Image */}
                  <div className="relative h-56 overflow-hidden bg-slate-900">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={act.activityPicture.media}
                      alt={act.activityName}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 to-transparent opacity-60"></div>

                    {/* Price badge */}
                    <div className="absolute top-4 right-4 bg-gradient-to-r from-purple-500 to-pink-500 px-4 py-2 rounded-lg">
                      <p className="text-xs font-black text-white">
                        {act.activityCost === 0
                          ? "Free"
                          : `+$${act.activityCost}`}
                      </p>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6 space-y-4 flex-1 flex flex-col">
                    <h4 className="text-lg font-black text-white group-hover:text-purple-400 transition-colors">
                      {act.activityName}
                    </h4>

                    <p className="text-sm text-slate-400 line-clamp-2 flex-1">
                      {act.description}
                    </p>

                    {/* Details */}
                    <div className="space-y-2 pt-2 border-t border-slate-700/60">
                      <div className="flex items-center gap-2 text-xs text-slate-400">
                        <Clock size={14} className="text-purple-400" />
                        <span>{formatDateOnly(act.activityStartDateTime)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-400">
                        <MapPin size={14} className="text-purple-400" />
                        <span>
                          {act.isOnline ? "Online Event" : act.activityLocation}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* WHY EXPERIENCES SECTION */}
      <section className="relative py-32 overflow-hidden">
        <div className="max-w-5xl mx-auto px-4 md:px-8">
          <ScrollReveal>
            <div className="text-center mb-20">
              <span className="text-sm font-black uppercase tracking-widest text-cyan-400">
                Why choose us
              </span>
              <h2 className="text-5xl md:text-6xl font-black mt-4 text-white leading-tight">
                More Than Just Tickets
              </h2>
              <p className="text-lg text-slate-400 mt-4 max-w-2xl mx-auto">
                We connect you with moments that matter—curated experiences
                designed to create lasting memories.
              </p>
            </div>
          </ScrollReveal>

          <div className="space-y-6">
            {[
              {
                title: "Curated Experiences",
                desc: "Hand-picked events that match your interests and lifestyle",
                icon: "✨",
              },
              {
                title: "Instant Discovery",
                desc: "Find what's happening around you in real-time",
                icon: "⚡",
              },
              {
                title: "Secure Booking",
                desc: "Easy checkout with multiple payment options",
                icon: "🔒",
              },
            ].map((feature, idx) => (
              <ScrollReveal key={idx} delay={idx * 100}>
                <div className="group bg-slate-800/30 backdrop-blur-sm border border-slate-700/60 rounded-2xl p-8 hover:border-cyan-500/60 transition-all duration-300 hover:bg-slate-800/50">
                  <div className="flex items-start gap-6">
                    <div className="text-4xl flex-shrink-0">{feature.icon}</div>
                    <div>
                      <h3 className="text-2xl font-black text-white mb-2">
                        {feature.title}
                      </h3>
                      <p className="text-slate-400 text-lg">{feature.desc}</p>
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="relative py-32 overflow-hidden">
        <div className="max-w-5xl mx-auto px-4 md:px-8 text-center">
          <ScrollReveal>
            <div className="space-y-8">
              <h2 className="text-5xl md:text-6xl font-black text-white leading-tight">
                Your Next Unforgettable <br /> Moment is Waiting
              </h2>
              <p className="text-xl text-slate-300 max-w-2xl mx-auto">
                Join thousands of explorers discovering extraordinary
                experiences every day.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
                <button className="px-12 py-4 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-black text-lg rounded-xl hover:shadow-2xl hover:shadow-cyan-500/50 transition-all duration-300 transform hover:scale-110 group flex items-center justify-center gap-3">
                  Start Exploring
                  <ArrowRight
                    className="group-hover:translate-x-2 transition-transform"
                    size={20}
                  />
                </button>
                <button className="px-12 py-4 border-2 border-slate-600 hover:border-cyan-500 text-white font-semibold rounded-xl transition-all duration-300">
                  See All Events
                </button>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-slate-800 bg-slate-950/50 backdrop-blur-sm mt-32">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-xl flex items-center justify-center">
                  <Sparkles size={20} className="text-white" />
                </div>
                <span className="font-black text-2xl text-white">
                  Experienz
                </span>
              </div>
              <p className="text-slate-400 max-w-sm leading-relaxed">
                Discover unforgettable moments happening around you. From music
                festivals to intimate workshops—your next adventure awaits.
              </p>
            </div>

            <div>
              <h4 className="font-black text-white mb-4 uppercase text-sm tracking-widest">
                Explore
              </h4>
              <ul className="space-y-3">
                <li>
                  <a
                    href="#"
                    className="text-slate-400 hover:text-cyan-400 transition-colors"
                  >
                    Browse Events
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-slate-400 hover:text-cyan-400 transition-colors"
                  >
                    Categories
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-slate-400 hover:text-cyan-400 transition-colors"
                  >
                    Trending
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-black text-white mb-4 uppercase text-sm tracking-widest">
                Company
              </h4>
              <ul className="space-y-3">
                <li>
                  <a
                    href="#"
                    className="text-slate-400 hover:text-cyan-400 transition-colors"
                  >
                    About
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-slate-400 hover:text-cyan-400 transition-colors"
                  >
                    Contact
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-slate-400 hover:text-cyan-400 transition-colors"
                  >
                    Blog
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-slate-500 text-sm">
              &copy; 2026 Experienz. Crafted with moments in mind.
            </p>
            <div className="flex gap-6 mt-4 md:mt-0">
              <a
                href="#"
                className="text-slate-400 hover:text-cyan-400 transition-colors"
              >
                Privacy
              </a>
              <a
                href="#"
                className="text-slate-400 hover:text-cyan-400 transition-colors"
              >
                Terms
              </a>
              <a
                href="#"
                className="text-slate-400 hover:text-cyan-400 transition-colors"
              >
                Cookies
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
