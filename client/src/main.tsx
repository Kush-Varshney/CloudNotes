import React from "react"
import { createRoot } from "react-dom/client"
import { RouterProvider, createBrowserRouter } from "react-router-dom"
import App from "./App"
import SignUp from "./pages/SignUp"
import Login from "./pages/Login"
import Dashboard from "./pages/Dashboard"
import "./styles.css"

const router = createBrowserRouter([
  { path: "/", element: <SignUp /> },
  { path: "/login", element: <Login /> },
  { path: "/dashboard", element: <Dashboard /> },
  { 
    path: "*", 
    element: (
      <div style={{ padding: "20px", textAlign: "center" }}>
        <h1>404 - Page Not Found</h1>
        <p>The page you're looking for doesn't exist.</p>
        <a href="/" style={{ color: "#3b82f6" }}>Go back to home</a>
      </div>
    ) 
  },
])

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
)
