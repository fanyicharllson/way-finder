import hero from "./assets/images/hero.webp.jpg";
import wayfinderAIimage from "./assets/images/Wayfinder AI.jpg";
import wayfinderHomescreenImage from "./assets/images/HOME SCREEN1.jpg";
import wayfinderMapImage from "./assets/images/MAP.jpg";
import developer1 from "./assets/images/developer1.jpg";
import developer2 from "./assets/images/developer2.jpg";
import MAP from "./assets/images/MAP.jpg";
import TRIPHISTORY from "./assets/images/TRIP HISTORY .jpg";

export const LINKS = [
  {
    name: "Features",
    link: "#Features",
  },
  {
    name: "How it works",
    link: "#How it works",
  },
  {
    name: "Developers",
    link: "#Developers",
  },
  {
    name: "Contact",
    link: "#contact",
  },
];

export const HERO_CONTENT = {
  title: "WayFinder",
  subtitle: "Move smart, spend smart",
  image: hero,
};

export const FEATURES_CONTENT = [
  {
    title: "WAYFINDER AI",
    description:
      "Find the best and most convenient way for you to get to your destination simply by asking.",
    image: wayfinderAIimage,
    alt: "WAYFINDER AI",
  },
  {
    title: "WayFinder Homescreen",
    description:
      "Define your present location and your destination.",
    image: wayfinderHomescreenImage,
    alt: "WayFinder Homescreen",
  },
  {
    title: "Wayfinder Map",
    description:
      " See the map view of where you are and how long it will take to get to where you are going to.",
    image: wayfinderMapImage,
    alt: "Wayfinder Map",
  },
];

export const HOW_IT_WORKS = [
  {
    id: 1,
    name: "Search & Plan",
    description: "Quickly find the best route and the most convenient transport mode for your trip.",
    image: wayfinderMapImage,
    link: "#",
  },
  {
    id: 2,
    name: "Compare Options",
    description: "Compare routes, time, and cost to choose the best option.",
    image: wayfinderHomescreenImage,
    link: "#",
  },
  {
    id: 3,
    name: "Navigate",
    description: "Follow step-by-step directions and real-time updates to reach your destination.",
    image: wayfinderMapImage,
    link: "#",
  },
];

export const HOW_IT_WORKS_CONTENT = HOW_IT_WORKS;

export const Developers = {
  text: "The Amazing minds behind WayFinder.",
  developers: [
  
    {
      name: "Fanyi Charllson Fanyi",
      title: "SCRUM MASTER AND UTIMATE DEVELOPER",
      image: developer1,
    },
    {
      name: "Lum Nchifor",
      title: "Developer",
      image: developer2,
    },
  ],
};

export const CONTACT_INFO = {
  text: "Have questions or need more information? Get in touch with us, and we ll be happy to assist you.",
  phone: {
    label: "Phone",
    value: "+237670830282",
  },
  email: {
    label: "Email",
    value: "fanyicharllson@gmail.com",
  },
};
