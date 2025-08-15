'use client'

export default function SimpleTest() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          GoTryke Landing Page
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          Welcome to the transportation management platform
        </p>
        <div className="space-x-4">
          <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Sign In
          </button>
          <button className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700">
            Sign Up
          </button>
        </div>
      </div>
    </div>
  )
}