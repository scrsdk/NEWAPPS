// src/server_utils.ts
'use server' // <-- Убедитесь, что это "use server"
import axios from "axios"
import { UserModel } from "./@types/data.t"
import { cookies } from "next/headers"

const isLoginCheck = async (): Promise<UserModel | null> => {
    const url = `${process.env.NEXT_PUBLIC_BASE_PATH}/api/auth/me`;
    const tokenFromCookie = cookies().get('token')?.value;

    // ЭТОТ ЛОГ ОЧЕНЬ ВАЖЕН!
    console.log("isLoginCheck (SERVER): Token from cookie:", tokenFromCookie ? "Exists" : "Does not exist", tokenFromCookie); // <--- ДОБАВЬТЕ/ПРОВЕРЬТЕ ЭТОТ ЛОГ

    if (!tokenFromCookie) {
        console.log("isLoginCheck (SERVER): No authentication token found in cookies. Returning null.");
        return null;
    }

    console.log("isLoginCheck (SERVER): Attempting to connect to:", url);
    try {
        const userData = await axios.post(url, {}, {
            headers: {
                Authorization: `Bearer ${tokenFromCookie}`
            }
        });
        console.log("isLoginCheck (SERVER): Successfully got user data.");
        return userData.data ?? null;
    } catch (error) {
        // ... (ваша обработка ошибок)
        return null;
    }
}

export {
    isLoginCheck,
