import { NavLink } from "react-router-dom";

export default function Layout({ children }) {
    return (
        <div>
            <nav style={styles.navbar}>
                <h2>My App</h2>
                <ul style={styles.navList}>
                    <li>
                        <NavLink to="/" style={getActiveStyle}>Home</NavLink>
                    </li>
                    <li>
                        <NavLink to="/user/1" style={getActiveStyle}>User 1</NavLink>
                    </li>
                    <li>
                        <NavLink to="/user/2" style={getActiveStyle}>User 2</NavLink>
                    </li>
                    <li>
                        <NavLink to="/register" style={getActiveStyle}>Register</NavLink>
                    </li>
                </ul>
            </nav>

            <div style={styles.content}>{children}</div>
        </div>
    );
}

const getActiveStyle = ({ isActive }) => ({
    color: isActive ? "yellow" : "white",
    textDecoration: "none",
    fontWeight: isActive ? "bold" : "normal"
});

const styles = {
    navbar: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "10px 20px",
        background: "#333",
        color: "white"
    },
    navList: {
        listStyle: "none",
        display: "flex",
        gap: "15px"
    },
    content: {
        padding: "20px"
    }
};
