import React from "react";
import { Link } from "react-router-dom";
import "../styles/Navbar.css";

export default function Navbar() {
  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to="/" className="brand">Buckit</Link>
        <div className="nav-right">
          <Link to="/lists" className="nav-link">My Lists</Link>
          <Link to="/create" className="nav-cta">+ Create</Link>
        </div>
      </div>
    </nav>
  );
}