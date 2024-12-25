'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { BackgroundBeams } from "@repo/ui/background-beams";
import { motion } from "framer-motion";
import axios from "axios";
import Link from 'next/link';
export default function SignIn() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/auth/signin`,{
        email,
        password,
      });
      console.log(result.data)
      if (result.data.message==="invalid password") {
        setError('Invalid credentials');
      } else {
        localStorage.setItem("auth_token",result.data.token);
        router.push('/home');
      }
    } catch (error) {
      setError('An error occurred during sign in');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async() => {
    try{
        const token = localStorage.getItem("auth_token");
        if(token){
            router.push("/home");
            return;
        }
        setLoading(true);
        const urlResponse = await axios.get("http://localhost:3001/api/v1/auth/google/url");
        if(urlResponse.status!==200){
            setLoading(false);
            setError("Failed to generate auth url");
            console.error(urlResponse.data.message);
            return;
        }
        const url = urlResponse.data.url;
        console.log(url);
        window.location.href = url;

        window.addEventListener("message",async(event)=>{
            if(event.data.status===200 && event.data.message==="GOOGLE_CALLBACK"){

                const {code} = event.data;
                console.log("code",code);
                const tokenResponse = await axios.get(`http://localhost:3001/api/v1/auth/google/callback?code=${code}`);
                if(tokenResponse.data.status!==200){
                    setError("Failed to get token");
                    setLoading(false);
                    console.error(tokenResponse.data.message);
                    return;
                }
                const token = tokenResponse.data.token;
                console.log(token);
                if(!token){
                    setLoading(false);
                    setError("Failed to get token");
                    return;
                }
                localStorage.setItem("auth_token",token);
                setLoading(false);
                router.push("/home");
                
                return;
            }else{
                setError("Failed to sign in with google");
                setLoading(false);
                return;
            }
        })

    }catch(error){
      console.log(error,"error in google sign in")
    }finally{

    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white to-cyan-50 relative" suppressHydrationWarning>
      <BackgroundBeams />
      <motion.div 
        suppressHydrationWarning
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full space-y-8 relative z-10 bg-white/80 backdrop-blur-md p-8 rounded-2xl shadow-xl"
      >
        <div>
          <motion.h2 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mt-6 text-center text-3xl font-extrabold bg-gradient-to-r from-teal-500 to-cyan-500 bg-clip-text text-transparent"
          >
            Sign in to your account
          </motion.h2>
          <p className="text-center text-md text-gray-500">new here? <Link href="/signup" className="text-teal-500 hover:text-teal-600 underline">Sign up</Link></p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email" className="sr-only">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="appearance-none rounded-t-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-teal-500 focus:border-teal-500 focus:z-10 sm:text-sm"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="appearance-none rounded-b-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-teal-500 focus:border-teal-500 focus:z-10 sm:text-sm"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {error && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-red-500 text-sm text-center"
            >
              {error}
            </motion.div>
          )}

          <div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-all duration-200"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </motion.button>
          </div>
        </form>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">
                Or continue with
              </span>
            </div>
          </div>

          <div className="mt-6">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick = {handleGoogleSignIn}
              className="w-full flex items-center justify-center gap-3 rounded-full bg-white py-3 px-4 text-sm font-semibold text-gray-700 border border-gray-300 hover:border-gray-400 transition-all duration-200"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Sign up with Google
            </motion.button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
