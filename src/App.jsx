import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./components/Home";
import CreateList from "./components/CreateList";
import CreateLoading from "./components/CreateLoading";
import ListResults from "./components/ListResults";
import ListIndex from "./components/ListIndex";
import "./styles/App.css";

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/create" element={<CreateList />} />
        <Route path="/create/loading" element={<CreateLoading />} />
        <Route path="/lists" element={<ListIndex />} />
        <Route path="/lists/:id" element={<ListResults />} />
      </Routes>
    </BrowserRouter>
  );
}