import React from "react";

export default function Card({ number, heading, body }) {
  return (
    <div className="card">
      <div className="number" aria-hidden="true">{number}</div>
      <h3>{heading}</h3>
      <p>{body}</p>
    </div>
  );
}