import HeroPlayer from '../components/HeroPlayer';

const Home = () => {
    return (
        <div className="container mx-auto px-4 py-4 sm:py-8">
            <section className="text-center py-12 sm:py-20">
                <h1 className="text-4xl sm:text-5xl md:text-7xl font-title font-extrabold mb-4 tracking-tight">
                    CTN RADIO
                </h1>
                <p className="text-lg sm:text-xl md:text-2xl text-gray-300 font-body max-w-2xl mx-auto italic mb-8 sm:mb-12 px-4">
                    "De Guarambaré al mundo"
                </p>

                <HeroPlayer />
            </section>
        </div>
    );
};

export default Home;
