import { useParams } from "react-router-dom";

function User() {
    let { id } = useParams();

    return (
        <div>
            <h2>User Profile</h2>
            <p>Welcome, user with ID: {id}!</p>
        </div>
    );
}

export default User;
