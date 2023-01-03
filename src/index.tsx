import React from 'react';
import { createRoot } from "react-dom/client";
import { App } from "./App";

const container = document.getElementById("app");
if (!container) {
  throw new Error("root element not found in page");
}
const root = createRoot(container);
root.render(<App />);
