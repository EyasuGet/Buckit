import React from "react";
import Card from "./Card";
import { useNavigate } from "react-router-dom";
import "../styles/Home.css";

const steps = [
  { number: "1", heading: "Tell Us About You", body: "Share your location, group size, and what you're in the mood for." },
  { number: "2", heading: "AI Creates Your List", body: "Our AI finds activities perfectly matched to your preferences." },
  { number: "3", heading: "Pick & Go", body: "Choose what looks fun and start your adventure." },
  { number: "4", heading: "Track & Share", body: "Mark completed activities and build your memory collection." },
];

export default function Home() {
  const navigate = useNavigate();
  return (
    <main className="home">
      <div className="container">
        <section className="hero">
          <h1>Your Phone Is Not Your Life</h1>
          <p>
            AI that gets you off your phone and into the real world. Discover
            adventures that happen outside, with actual humans, in physical places.
          </p>
          <button className="cta" onClick={() => navigate("/create")}>
            Create Your First Adventure
          </button>
        </section>

        <section className="how">
          <h2 className="section-title">How It Works</h2>
          <div className="cards">
            {steps.map((s) => (
              <Card key={s.number} number={s.number} heading={s.heading} body={s.body} />
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}