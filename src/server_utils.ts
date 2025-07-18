
'use server'
import axios from "axios"
import { UserModel } from "./@types/data.t"
import { cookies } from "next/headers"

const isLoginCheck = async (): Promise<UserModel | null> => {
    const url = `${process.env.NEXT_PUBLIC_BASE_PATH}/api/auth/me`;
    const tokenFromCookie = cookies().get('token')?.value; // Сменил имя переменной для ясностиconsole.log("isLoginCheck: Token from cookie:", tokenFromCookie ? "Exists" : "Does not exist", tokenFromCookie); // &lt;--- ДОБАВЬТЕ ЭТОТ ЛОГ

if (!tokenFromCookie) {
    console.log("isLoginCheck: No authentication token found in cookies. Returning null.");
    return null; // Если токена нет, то даже не отправляем запрос
}

console.log("isLoginCheck: Attempting to connect to:", url);
try {
    const userData = await axios.post(url, {}, {
        headers: {
            Authorization: `Bearer ${tokenFromCookie}` // Отправляем токен в заголовке
        }
    });
    console.log("isLoginCheck: Successfully got user data.");
    return userData.data ?? null;
} catch (error) {
    if (axios.isAxiosError(error)) {
        console.error("isLoginCheck: Error connecting to backend:", error.message);
        if (error.response) {
            console.error("isLoginCheck: Backend response status:", error.response.status);
            console.error("isLoginCheck: Backend response data:", error.response.data);
        }
    } else if (error instanceof Error) {
        console.error("isLoginCheck: An unexpected error occurred:", error.message);
    } else {
        console.error("isLoginCheck: An unknown error occurred:", error);
    }
    return null;
}
}

export {
    isLoginCheck,
}
