import { useState } from "react";
import { RiCloseLine, RiMenuLine } from "@remixicon/react";
import { LINKS } from "../constants";
const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };
  return (
    <nav className="border-b-2 bg-blue-50 relative">
        <div className="max-w-7xl mx-auto flex justify-between items-center py-8">
            <div className="pl-2">
                <a href="a">
                    <img src="/logo.png" width={150} height={15} alt="WayFinder Logo"/>
                </a>
            </div>
            <div className="md:hidden">
                <button onClick={toggleMenu} className="text-2xl pr-2 focus:outline-none"
                aria-label={isOpen ? "Close menu" : "Open menu"} >
                {isOpen ?<RiCloseLine/> :<RiMenuLine/>}
                </button>
            </div>
            <div className="hidden md:flex space-x-8 pr-2">
                {LINKS.map((link, index) => (
                    <a key={index} href={link.link} className="uppercase text-sm font-medium">
                        {link.name}
                    </a>
                ))}
            </div>
        </div>
    <div className={`${isOpen ? "block" : "hidden"} md:hidden absolute bg-neutral-50 w-full py-5 px-4 mt-2 border-b-4`}>
        {LINKS.map((link, index) => (
        <a key={index} href={link.link} className=" uppercase 
        text-lg font-medium py-2 tracking-wide">
            {link.name}
            </a>
        ))}
    </div>
    </nav>
  );
};

export default Navbar;