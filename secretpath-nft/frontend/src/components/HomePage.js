import React from 'react';
import { useNavigate } from 'react-router-dom';


export default function HomePage() {

  let navigate = useNavigate();

  function handleCreateClick() {
    navigate('/create'); // Navigate to the create page
  }

  function handleViewClick() {
    navigate('/display'); // Navigate to the view page
  }

  return (
    
          <div className="sm:mx-auto sm:w-full sm:max-w-md justify-center items-center mt-20 ">
      <ul className="space-y-4">
        <li className="border-4 rounded-lg p-4 bg-white/5">
          <div
            onClick={handleCreateClick}
            className="block text-sm font-medium leading-6 text-white hover:text-indigo-300 underline shadow-sm focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm"
          >
            Create NFT
          </div>
        </li>
        <li className="border-4 rounded-lg p-4 bg-white/5">
          <div
            onClick={handleViewClick}
            className="block text-sm font-medium leading-6 text-white hover:text-indigo-300 underline shadow-sm focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm"
          >
            View NFTs
          </div>
        </li>
       
      </ul>
    </div>
    
  );
}
