import ConvertCard from "../components/ConvertCard";
import spotify from "../assets/img/convert-spotify.png";

const ConvertPage = () => {
    return (
        <section className="h-screen">
            <div className="grid place-content-center h-full">
                <ConvertCard img={spotify} link="/convert/spotify" />
            </div>
        </section>
    );
};

export default ConvertPage;
