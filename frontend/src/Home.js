import { useEffect, useState } from "react";
import axios from "axios";

function Home() {
  const [doubts, setDoubts] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState("");

  const fetchDoubts = () => {
    axios.get("http://localhost:5001/doubts")
      .then(res => setDoubts(res.data));
  };

  useEffect(() => {
    fetchDoubts();
  }, []);

  const addDoubt = () => {
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
    const user = `${name} (${role})`;

    localStorage.setItem("name", name);

    axios.post("http://localhost:5001/accept-doubt", {
      doubtId: id,
      userId: user
    }).then(res => {
      window.location.href = `/chat?roomId=${res.data._id}`;
    });
  };

  const deleteDoubt = (id) => {
    axios.delete(`http://localhost:5001/doubt/${id}`)
      .then(() => fetchDoubts());
  };

  return (
    <div className="container">
      <h1 className="title">🚀 DoubtSphere</h1>

      <div className="card">
        <input placeholder="Name" value={name} onChange={e => setName(e.target.value)} />
        <select value={role} onChange={e => setRole(e.target.value)}>
          <option value="">Role</option>
          <option value="Guide">Guide</option>
          <option value="User">User</option>
        </select>
      </div>

      <div className="card">
        <input placeholder="Title" value={title} onChange={e => setTitle(e.target.value)} />
        <input placeholder="Description" value={description} onChange={e => setDescription(e.target.value)} />
        <button onClick={addDoubt}>Add</button>
      </div>

      {doubts.map(d => (
        <div className="card" key={d._id}>
          <h3>{d.title}</h3>
          <p>{d.description}</p>
          <p>{d.status}</p>
          <p>{d.acceptedBy}</p>

          {d.status === "OPEN" && (
            <button onClick={() => acceptDoubt(d._id)}>Accept</button>
          )}

          {d.status === "MATCHED" && (
            <button onClick={() => window.location.href = `/chat?roomId=${d._id}`}>
              Open Chat
            </button>
          )}

          <button onClick={() => deleteDoubt(d._id)}>🗑 Delete</button>
        </div>
      ))}
    </div>
  );
}

export default Home;