import { RiFacebookFill, RiGithubFill, RiLinkedInFill } from "@remixicon/react"

const Footer = () => {
    return (
        <section className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-center border-t-2 py-4">
                <div className="flex space-x-6 mb-2">
                    <a href="https://www.facebook.com/WayFinderApp" 
                    target="_blank" rel="noopener noreferrer"
                    aria-label="visit us on Facebook">
                        <RiFacebookFill/>
                    </a>
                    <a href="https://www.github.com/WayFinderApp" 
                    target="_blank" rel="noopener noreferrer"
                    aria-label="visit us on Github">
                        <RiGithubFill/>
                    </a>
                    <a href="https://www.linkedin.com/WayFinderApp" 
                    target="_blank" rel="noopener noreferrer"
                    aria-label="visit us on Linkedin">
                        <RiLinkedInFill/>
                    </a>                   
                </div>
                <p className="text-sm">&copy; 2025 WayFinder App.All rights reserved.</p>
            </div>
        </section>
    )
}

export default Footer