import { Developers as DEVELOPERS_DATA } from "../constants";

const Developers = () => {
    const [dev1, dev2] = DEVELOPERS_DATA.developers;
    return (
        <section className="max-w-7xkmx-auto bordwer-b-2" id="Developers">
            <h2 className="text-xl lg:text-3xl tracking-tight text-center uppercase mb-12 mx-4">The Brains Behind WayFinder</h2>
            <div className="flex flex-col items-center lg:space-x-8 mx-4 mb-20">
                <div className="mb-8 lg:mb-0">
                    <img src={dev1.image} alt={dev1.name} className="w-full h-auto" />
                </div>
                <p className="text-lg lg:text-3xl font-light text-center lg:text-left max-w-5xl mx-auto mt-8">
                    <b>{dev1.name}</b> <br />{dev1.title}
                </p>
            </div>
            <div className="flex flex-col items-center lg:space-x-8 mx-4 mb-20">
                <p className="text-lg lg:text-3xl font-light text-center lg:text-left max-w-5xl mx-auto mt-8">
                    <b>{dev2.name}</b> <br />{dev2.title}
                </p>
            </div>
        </section>
    )
}
export default Developers;