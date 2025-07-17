// src/server_utils.ts

'use server'

import axios from "axios"
import { UserModel } from "./@types/data.t"
import { cookies } from "next/headers"

const isLoginCheck = async (): Promise<UserModel | null> => {
    const url = `${process.env.NEXT_PUBLIC_BASE_PATH}/api/auth/me`;
    const token = cookies().get('token')?.value; // Сначала пытаемся взять токен из куки

    // Если токена нет, то и запрос отправлять бессмысленно, если логика API Route
    // ожидает его в куках или заголовке.
    if (!token) {
        console.log("No authentication token found in cookies.");
        return null;
    }

    console.log("Attempting to connect to:", url); 
    try {
        // Отправляем пустой объект в теле и токен в заголовке Authorization
        // Это стандартная практика для /me эндпоинтов.
        const userData = await axios.post(url, {}, { 
            headers: {
                Authorization: `Bearer ${token}` 
            }
        });
        return userData.data ?? null;
    } catch (error) {
        if (axios.isAxiosError(error)) { // Проверяем, является ли это ошибкой Axios
            console.error("Error connecting to backend:", error.message); 
            if (error.response) {
                console.error("Backend response status:", error.response.status);
                console.error("Backend response data:", error.response.data); // Логгируем ответ от сервера
            }
        } else if (error instanceof Error) {
            console.error("An unexpected error occurred:", error.message);
        } else {
            console.error("An unknown error occurred:", error);
        }
        return null;
    }
}

export {
    isLoginCheck,
}
