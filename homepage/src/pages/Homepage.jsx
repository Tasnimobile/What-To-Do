import Header from "../components/Header"
import Sidebar from "../components/Sidebar";
import "./Homepage.css";

export default function Homepage() {
    return (
        <div className="homepage">
            <div className="main-left">
                <Header />
                <div className="map-placeholder">
                    <p>Map Placeholder</p>
                </div>
            </div>

            <div className="sidebar-container">
                <Sidebar />
            </div>
        </div>


    );
}

