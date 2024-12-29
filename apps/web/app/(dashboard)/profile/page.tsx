'use client';

import { useEffect, useState } from "react";
import {  useGetUser } from "../../hooks/index"
import Image from "next/image";
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
  const {user, isLoading, error, fetchUser} = useGetUser();

  useEffect(() => {
    fetchUser();
  }, []);

  if(isLoading) return <div className="text-gray-400">Loading...</div>;
  if(error) return <div className="text-red-500">Error: {error.message}</div>;
  
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-100 mb-8">Profile</h1>
      
      <div className="bg-black/60 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-gray-800">
        <div className="flex items-center space-x-4 mb-6">
          <Image 
            src={user?.profilePicture || 'https://static.vecteezy.com/system/resources/previews/020/168/719/non_2x/pretty-boy-with-stylish-hairstyle-flat-avatar-icon-with-green-dot-editable-default-persona-for-ux-ui-design-profile-character-picture-with-online-status-color-messaging-app-user-badge-vector.jpg'}
            alt="profile"
            width={40}
            height={40}
            className="rounded-full object-cover w-[40px] h-[40px]"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = '/default-avatar.png';
            }}
          />
          <div>
            <h2 className="text-xl font-bold text-gray-100">{user?.username}</h2>
            <p className="text-gray-400">{user?.email}</p>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Full Name
            </label>
            <input
              type="text"
              className="w-full p-3 border border-gray-800 rounded-xl 
                focus:ring-2 focus:ring-teal-500 focus:border-transparent 
                outline-none bg-black/50 text-gray-100
                transition-all duration-200
                shadow-sm"
              defaultValue="John Doe"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Email
            </label>
            <input
              type="email"
              className="w-full p-3 border border-gray-800 rounded-xl 
                focus:ring-2 focus:ring-teal-500 focus:border-transparent 
                outline-none bg-black/50 text-gray-100
                transition-all duration-200
                shadow-sm"
              defaultValue="john.doe@example.com"
            />
          </div>

          <button className="w-full bg-gradient-to-r from-teal-600 to-cyan-600 
            text-white px-6 py-3 rounded-xl 
            hover:from-teal-700 hover:to-cyan-700 
            transition-all duration-300
            shadow-md hover:shadow-lg">
            Update Profile
          </button>
        </div>
      </div>
    </div>
  );
}
