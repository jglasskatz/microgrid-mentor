import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Switch, Route, Router } from "wouter";
import "./index.css";
import { SWRConfig } from "swr";
import { fetcher } from "./lib/fetcher";
import { Toaster } from "@/components/ui/toaster";
import Whiteboard from "./pages/Whiteboard";
import ProductDetails from "./pages/ProductDetails";

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