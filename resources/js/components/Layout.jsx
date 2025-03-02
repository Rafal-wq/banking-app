import { Link } from "react-router-dom";

export default function Layout({ children }) {
    return (
        <div>
            <nav style={styles.navbar}>
                <h2>My App</h2>
                <ul style={styles.navList}>
                    <li><Link to="/">Home</Link></li>
                    <li><Link to="/user/1">User 1</Link></li>
                    <li><Link to="/user/2">User 2</Link></li>
                </ul>
            </nav>

            <div style={styles.content}>{children}</div>
        </div>
    );
}

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
