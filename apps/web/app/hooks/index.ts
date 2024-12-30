"use client";

import axios from "axios";
import * as dotenv from "dotenv";
import { useState, useEffect } from "react";
dotenv.config();

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

export const useGetUser = () => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<Error | null>(null);

    const fetchUser = async () => {
        try {
            const token = localStorage.getItem("auth_token");
            if (!token) return { success: false, error: "No token found" };

            setIsLoading(true);
            const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/user`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setUser(response.data.user);
            setIsLoading(false);
            setError(null);
            return { success: true, user: response.data.user };
        } catch (error) {
            console.error(error);
            setError(error as Error);
            setIsLoading(false);
            return { success: false, error };
        }
    };

    useEffect(() => {
        fetchUser();
    }, []);

    return { user, isLoading, error, fetchUser };
};
