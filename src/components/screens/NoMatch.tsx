import React from "react";
import { BeakerIcon } from '@heroicons/react/solid'

const NoMatch = () => {
  return (
    <div className="p-6 max-w-sm mx-auto bg-white rounded-xl shadow-md flex items-center space-x-4">
      <div className="flex-shrink-0">
        <BeakerIcon className="h-12 w-12" />
      </div>
      <div>
        <div className="text-xl font-medium text-black">404</div>
        <p className="text-gray-500">Can't find page!</p>
      </div>
    </div>
  );
};

export default NoMatch;