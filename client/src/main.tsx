import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Switch, Route, Router } from "wouter";
import "./index.css";
import { SWRConfig } from "swr";
import { Toaster } from "@/components/ui/toaster";
import Whiteboard from "./pages/Whiteboard";
import ProductDetails from "./pages/ProductDetails";

// Configure SWR with error handling and retries
const fetcher = (url: string) => {
  return fetch(url).then(async (r) => {
    if (!r.ok) {
      const error = new Error('API request failed');
      const data = await r.json().catch(() => ({}));
      (error as any).status = r.status;
      (error as any).info = data;
      throw error;
    }
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