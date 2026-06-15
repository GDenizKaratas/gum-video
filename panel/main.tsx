import React from "react";
import { createRoot } from "react-dom/client";
import { Root } from "./Root";
import "./styles.css";

const root = createRoot(document.getElementById("root")!);
root.render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>,
);
