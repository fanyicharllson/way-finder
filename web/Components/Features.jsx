import { FEATURES_CONTENT } from "../constants";

const Features= () => {
    return (
        <section className="max-w-7xl mx-auto border-b-2" id="Features">
            <div className="my-28">
                <h2 className="text-xl lg:text-3xl tracking-tight
               text-center uppercase nb-20 ">What Our App Offers</h2>
               {FEATURES_CONTENT.map((feature, index) => (
                <div key={index} className="mg-12 mx-4 flex flex-col lg:flex-row">
                    <div className={`lg:w-1/2 mb-4 lg:mb-0 ${
                      index % 2 === 0 ? "" : "lg:order-2"  
                    }`}> 
                    <img src={feature.image} alt={feature.image}
                    className="w-full h-auto object-cover rounded-lg"/>
                    </div>
                    <div className={`lg:w-1/2 flex flex-col ${
                    index % 2 === 0 ? "lg:pl-12" : "lg:pl-12" 
                    }`}>
                    <h3 className="text-xl lg:text-2xl font-medium mb-2">
                        {feature.title}
                    </h3>
                    <p className="md-auto lg:tracking-wide text-lg lg:text-xl
                    lg:leading-9">
                        {feature.description}
                    </p>
                            </div>
                            </div>
                           ))}
                        </div>
                    </section>
                );
            }
            
            export default Features;