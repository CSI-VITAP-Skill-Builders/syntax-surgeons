import { useEffect, useState } from "react";
import axios from "axios";

function App() {
  const [doubts, setDoubts] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState("");

  const fetchDoubts = () => {
    axios.get("http://localhost:5001/doubts")
      .then(res => setDoubts(res.data))
      .catch(err => console.log(err));
  };

  useEffect(() => {
    fetchDoubts();
  }, []);

  const addDoubt = () => {
    if (!title || !description) {
      alert("Fill all fields");
      return;
    }

    axios.post("http://localhost:5001/doubt", {
      title,
      description
    }).then(() => {
      setTitle("");
      setDescription("");
      fetchDoubts();
    });
  };

  const acceptDoubt = (id) => {
    if (!name || !role) {
      alert("Enter name and select role");
      return;
    }

    const userIdentity = `${name} (${role})`;

    axios.post("http://localhost:5001/accept-doubt", {
      doubtId: id,
      userId: userIdentity
    }).then(() => {
      fetchDoubts();
    }).catch(() => {
      alert("Already accepted!");
    });
  };

  return (
  <div className="container">

    <h1 className="title">🚀 DoubtSphere</h1>

    {/* USER INFO */}
    <div className="card">
      <input
        className="input"
        placeholder="Enter your name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <select
        className="input"
        value={role}
        onChange={(e) => setRole(e.target.value)}
      >
        <option value="">Select Role</option>
        <option value="Guide">Guide</option>
        <option value="User">User</option>
      </select>
    </div>

    {/* CREATE DOUBT */}
    <div className="card">
      <input
        className="input"
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <input
        className="input"
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />

      <button className="btn" onClick={addDoubt}>
        Add Doubt
      </button>
    </div>

    {/* LIST */}
    <div className="grid">
      {doubts.map((d) => (
        <div className="card" key={d._id}>
          <h3>{d.title}</h3>
          <p>{d.description}</p>

          <p className="status">
            {d.status === "OPEN" ? "🟢 OPEN" : "🔴 MATCHED"}
          </p>

          <p className="meta">
            👤 {d.acceptedBy || "Not accepted yet"}
          </p>

          <button
            className="btn"
            disabled={d.status !== "OPEN"}
            onClick={() => acceptDoubt(d._id)}
          >
            Accept
          </button>
        </div>
      ))}
    </div>

  </div>
);
}

export default App;