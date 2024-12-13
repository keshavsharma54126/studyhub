'use client';

import { useEffect, useState } from "react";
import {  useGetUser } from "../../hooks/index"

type User = {
  id: string;
  email: string;
  username: string;
  profilePicture: string;
  sessions: Session[];
}

type Session = {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
}
export default function ProfilePage() {
  const {user,isLoading,error,fetchUser} = useGetUser();

 useEffect(() => {
  fetchUser();
 }, []);

 if(isLoading) return <div>Loading...</div>;
 if(error) return <div>Error: {error.message}</div>;
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-8">Profile</h1>
      
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6">
        <div className="flex items-center space-x-4 mb-6">
          <img src={user?.profilePicture} alt="profile" width={60} height={60} className="rounded-full" />
          <div>
            <h2 className="text-xl font-bold text-gray-800 dark:text-white">{user?.username}</h2>
            <p className="text-gray-600 dark:text-gray-400">{user?.email}</p>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Full Name
            </label>
            <input
              type="text"
              className="w-full p-3 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
              defaultValue="John Doe"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Email
            </label>
            <input
              type="email"
              className="w-full p-3 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
              defaultValue="john.doe@example.com"
            />
          </div>

          <button className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300">
            Update Profile
          </button>
        </div>
      </div>
    </div>
  );
}
