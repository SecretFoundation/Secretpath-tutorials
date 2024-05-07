import React from "react";
import { Link, useLocation } from "react-router-dom";

function Navigation() {
  const location = useLocation();

  // Check if the current pathname is '/posts'
  if (location.pathname === "/create" || location.pathname === "/vote") {
    // Return null or any other element you want to render instead of the navigation bar
    return null;
  }

  return (
    <nav className="sm:mx-auto sm:w-full sm:max-w-md ">
      <ul className="space-y-4">
        <li className="border-4 rounded-lg p-4 bg-white/5">
          <Link
            to="/create"
            className="block text-sm font-medium leading-6 text-white hover:text-indigo-300 underline shadow-sm focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm"
          >
            Create a Proposal
          </Link>
        </li>
        <li className="border-4 rounded-lg p-4 bg-white/5">
          <Link
            to="/vote"
            className="block text-sm font-medium leading-6 text-white hover:text-indigo-300 underline shadow-sm focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm"
          >
            Vote on a proposal
          </Link>
        </li>
        {/* Add other navigation links as needed */}
      </ul>
    </nav>
  );
}

export default Navigation;
