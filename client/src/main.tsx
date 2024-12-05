import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Switch, Route, Router } from "wouter";
import "./index.css";
import { SWRConfig } from "swr";
import { Toaster } from "@/components/ui/toaster";
import Whiteboard from "./pages/Whiteboard";
import ProductDetails from "./pages/ProductDetails";

// Configure SWR to use the FastAPI backend
const fetcher = (url: string) => {
  const baseUrl = "http://localhost:8000";
  const fullUrl = url.startsWith("/") ? `${baseUrl}${url}` : `${baseUrl}/${url}`;
  return fetch(fullUrl).then(r => {
    if (!r.ok) throw new Error('API request failed');
    return r.json();
  });
};

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <SWRConfig value={{ fetcher }}>
      <Router>
        <Switch>
          <Route path="/" component={Whiteboard} />
          <Route path="/products/:id" component={ProductDetails} />
          <Route>404 Page Not Found</Route>
        </Switch>
      </Router>
      <Toaster />
    </SWRConfig>
  </StrictMode>,
);