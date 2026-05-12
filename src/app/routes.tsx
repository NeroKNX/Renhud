import { createHashRouter } from "react-router";
import { LandingPage } from "./pages/landing";
import { LoginPage } from "./pages/login";
import { RegisterPage } from "./pages/register";
import { ChatPage } from "./pages/chat";

export const router = createHashRouter([
  {
    path: "/",
    Component: LandingPage,
  },
  {
    path: "/login",
    Component: LoginPage,
  },
  {
    path: "/register",
    Component: RegisterPage,
  },
  {
    path: "/chat",
    Component: ChatPage,
  },
  {
    path: "/chat/:sessionId",
    Component: ChatPage,
  },
]);
