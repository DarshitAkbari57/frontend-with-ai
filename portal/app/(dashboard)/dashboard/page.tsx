import React from 'react';
import { Calendar, Users, Heart, MapPin, Activity, Star, Clock, ArrowRight } from 'lucide-react';

const mockExperiences = [
  {
    id: 30,
    title: "Nebula Music Festival",
    description: "Experience the ultimate electronic music festival with top DJs and immersive visuals.",
    likeCount: 1240,
    commentCount: 89,
    experienceStartDateTime: "2026-02-27T02:01:38.038Z",
    location: "135 W 41st St, New York, NY",
    color: { background_colour: "#00C853", button_bg_colour: "#001f2d" },
    expPicture: { media: "https://images.unsplash.com/photo-1540039155733-d7696c4bc9ff?q=80&w=1000&auto=format&fit=crop" },
    userDetail: { userName: "NebulaLive", profilePicture: { media: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop" } }
  },
  {
    id: 31,
    title: "Oracle Tech Summit",
    description: "Deep dive into the future of cloud computing, AI, and enterprise architecture.",
    likeCount: 856,
    commentCount: 42,
    experienceStartDateTime: "2026-03-15T09:00:00.000Z",
    location: "Moscone Center, San Francisco, CA",
    color: { background_colour: "#00C853", button_bg_colour: "#001f2d" },
    expPicture: { media: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=1000&auto=format&fit=crop" },
    userDetail: { userName: "OracleEvents", profilePicture: { media: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop" } }
  }
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
    activityPicture: { media: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=1000&auto=format&fit=crop" }
  },
  {
    id: 2,
    activityName: "Cloud Architecture Workshop",
    description: "Hands-on session with top engineers.",
    activityStartDateTime: "2026-03-15T11:00:00.000Z",
    activityCost: 0,
    activityLocation: "Room 3B",
    isOnline: true,
    activityPicture: { media: "https://images.unsplash.com/photo-1531482615713-2afd69097998?q=80&w=1000&auto=format&fit=crop" }
  },
  {
    id: 3,
    activityName: "Afterparty Celebration",
    description: "Unwind and network with fellow attendees.",
    activityStartDateTime: "2026-02-28T02:00:00.000Z",
    activityCost: 50,
    activityLocation: "Rooftop Lounge",
    isOnline: false,
    activityPicture: { media: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=1000&auto=format&fit=crop" }
  }
];

export default function DashboardPage() {
  return (
    <div>
      <h2 className="mb-6 text-2xl font-semibold">Dashboard</h2>
      <p className="text-zinc-600 dark:text-zinc-400">
        Welcome to the Experience Portal. You are successfully logged in.
      </p>
    </div>
  );
}
