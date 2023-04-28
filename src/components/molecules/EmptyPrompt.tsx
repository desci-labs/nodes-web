import { PlusIcon } from '@heroicons/react/outline'
import React from 'react'


/* This example requires Tailwind CSS v2.0+ */
export default function EmptyPrompt() {
    return (
      <button
        type="button"
        className="relative block w-full border-2 border-gray-300 dark:border-gray-700 border-dashed rounded-lg p-12 text-center hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        <PlusIcon className="h-24 items-center flex align-middle justify-center m-auto" stroke="#555" />
        <span className="mt-2 block text-sm font-medium text-gray-400 dark:text-gray-500">Begin Discovery Submission</span>
      </button>
    )
  }
  