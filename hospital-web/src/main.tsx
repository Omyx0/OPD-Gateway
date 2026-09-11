import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "@tanstack/react-router";
import { getRouter } from "./router";
import { StaffAuthProvider } from "@/state/staff-auth";
import "./styles.css";

const router = getRouter();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <StaffAuthProvider>
      <RouterProvider router={router} />
    </StaffAuthProvider>
  </React.StrictMode>,
);
