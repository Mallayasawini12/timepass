import { createBrowserRouter } from "react-router-dom";
import App from "@/App";
import Auth from "@/pages/Auth";
import Feed from "@/pages/Feed";
import Profile from "@/pages/Profile";
import Reels from "@/pages/Reels";
import NotFound from "@/pages/NotFound";
import Create from "@/pages/Create";

import { ProtectedRoute } from "@/App";

export const router = createBrowserRouter(
  [
    {
      path: "/",
      element: <App />,
      children: [
        {
          index: true,
          element: (
            <ProtectedRoute>
              <Feed />
            </ProtectedRoute>
          ),
        },
        {
          path: "auth",
          element: <Auth />,
        },
        {
          path: "profile/:userId",
          element: (
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          ),
        },
        {
          path: "reels",
          element: (
            <ProtectedRoute>
              <Reels />
            </ProtectedRoute>
          ),
        },
        {
          path: "create",
          element: (
            <ProtectedRoute>
              <Create />
            </ProtectedRoute>
          ),
        },
        {
          path: "*",
          element: <NotFound />,
        },
      ],
    },
  ],
  {
    future: {
      // @ts-ignore - This is a valid future flag for React Router v7
      v7_startTransition: true
    }
  }
);