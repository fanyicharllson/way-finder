import { HERO_CONTENT } from "../constants"

const hero = () => {
    return (
        <section className="max-w-7xl mx-auto border-b-2">
            <div className="flex flex-col items-center my-28">
                <h1 className="text-6xl lg:text-[18rem] p-2 uppercase font-bold">
                    {HERO_CONTENT.title}
                </h1>
                <p className="lg:mt-6 text-sm mb-4 font-medium tracking-wide">
                    {HERO_CONTENT.subtitle}
                </p>
                <img src={HERO_CONTENT.image} alt="Hero Image" className="w-full h-[65vh] object-cover rounded-2xl p-2" />
            </div>
        </section>
    )
}

export default hero