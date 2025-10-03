import "./Header.css";

export default function Header({ onBack }) {
  return (
    <div className="header">
      <button className="back-button" onClick={onBack}>
        ←
      </button>
      <h2>What To Do - New York City</h2>
      <button className="user-icon">👤</button>
    </div>
  );
}
