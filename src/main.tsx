
  import { createRoot } from "react-dom/client";
  import { BrowserRouter } from "react-router";
  import Root from "./app/Root.tsx";
  import "./styles/index.css";

  createRoot(document.getElementById("root")!).render(
    <BrowserRouter>
      <Root />
    </BrowserRouter>
  );
  