'use server'

import axios from "axios"
import { UserModel } from "./@types/data.t"
import { cookies } from "next/headers"

const isLoginCheck = async (): Promise<UserModel | null> => {
        const url = `${process.env.NEXT_PUBLIC_BASE_PATH}/api/auth/me`;
        console.log("Attempting to connect to:", url); // Добавьте это
        try {
            const userData = await axios.post(url, cookies().get('token')?.value);
            return userData.data ?? null;
        } catch (error) {
            console.error("Error connecting to backend:", error.message); // Добавьте это
            return null;
        }
    }
