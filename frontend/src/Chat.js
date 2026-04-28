import { useEffect, useState, useRef } from "react";
import socket from "./socket";
import axios from "axios";
import EmojiPicker from "emoji-picker-react";

function Chat() {
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([]);
  const [typing, setTyping] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);

  const messagesEndRef = useRef(null);
  const audioRef = useRef(null);

  const roomId = new URLSearchParams(window.location.search).get("roomId");
  const name = localStorage.getItem("name");

  /* ---------- LOAD ---------- */
  useEffect(() => {
    socket.emit("join_room", roomId);

    axios.get(`http://localhost:5001/messages/${roomId}`)
      .then(res => setChat(res.data));

    socket.on("receive_message", (data) => {
      setChat(prev => [...prev, data]);

      // 🔔 SOUND
      if (data.sender !== name) {
        audioRef.current.play();
      }
    });

    socket.on("typing", (user) => {
      if (user !== name) {
        setTyping(user);
        setTimeout(() => setTyping(""), 1500);
      }
    });

    return () => socket.off();
  }, [roomId, name]);

  /* ---------- AUTO SCROLL ---------- */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat]);

  /* ---------- SEND ---------- */
  const sendMessage = () => {
    if (!message.trim()) return;

    const data = {
      roomId,
      message,
      sender: name,
      time: new Date().toLocaleTimeString()
    };

    socket.emit("send_message", data);
    setMessage("");
  };

  /* ---------- EMOJI ---------- */
  const onEmojiClick = (emojiData) => {
    setMessage(prev => prev + emojiData.emoji);
  };

  return (
    <div className="chat-container">

      {/* SOUND */}
      <audio ref={audioRef} src="https://www.soundjay.com/buttons/sounds/button-3.mp3" />

      {/* HEADER */}
      <div className="chat-header">
        <button onClick={() => window.location.href = "/"}>⬅</button>
        <strong>Private Chat</strong>
      </div>

      {/* BODY */}
      <div className="chat-body">
        {chat.map((msg, i) => (
          <div key={i} className={`message ${msg.sender === name ? "own" : "other"}`}>
            <div className="bubble">
              <div>{msg.message}</div>
              <div className="time">{msg.time}</div>
            </div>
          </div>
        ))}

        {/* Typing animation */}
        {typing && (
          <div className="typing-dots">
            {typing} typing
            <span>.</span><span>.</span><span>.</span>
          </div>
        )}

        <div ref={messagesEndRef}></div>
      </div>

      {/* FOOTER */}
      <div className="chat-footer">
        <button onClick={() => setShowEmoji(!showEmoji)}>😄</button>

        <input
          value={message}
          onChange={(e) => {
            setMessage(e.target.value);
            socket.emit("typing", name);
          }}
        />

        <button onClick={sendMessage}>➤</button>
      </div>

      {/* EMOJI PICKER */}
      {showEmoji && (
        <div className="emoji-box">
          <EmojiPicker onEmojiClick={onEmojiClick} />
        </div>
      )}

    </div>
  );
}

export default Chat;