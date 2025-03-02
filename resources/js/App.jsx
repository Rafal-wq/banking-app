import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import User from "./pages/User";
import Layout from "./components/Layout"; // Importujemy layout

function App() {
    return (
        <Router>
            <Layout>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/user/:id" element={<User />} />
                </Routes>
            </Layout>
        </Router>
    );
}

export default App;
