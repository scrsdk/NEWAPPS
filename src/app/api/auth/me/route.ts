// app/api/auth/me/route.ts
import connectToDB from "@/db/db";
import UserModel from "@/models/User";
import { tokenDecoder } from "@/utils";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server"; // Обязательно импортируйте их!

export const POST = async (req: NextRequest) => { // Используйте NextRequest
    try {
        await connectToDB();

        let token: string | undefined;

        // --- ТОЛЬКО ТАК МЫ ИЩЕМ ТОКЕН ---
        // 1. Попытка получить токен из куки
        token = cookies().get('token')?.value;

        // 2. Если токена нет в куки, пытаемся получить его из заголовка Authorization
        if (!token) {
            const authorizationHeader = req.headers.get('Authorization');
            if (authorizationHeader?.startsWith('Bearer ')) {
                token = authorizationHeader.split(' ')[1];
            }
        }
        // --- БОЛЬШЕ НЕТ await req?.json() ЗДЕСЬ! ---

        // 3. Если токена все еще нет, возвращаем ошибку
        if (!token) {
            console.warn('Authentication token missing for /api/auth/me request.');
            return NextResponse.json({ message: 'Authentication token missing.' }, { status: 401 });
        }

        // Далее ваша логика обработки токена
        const verifiedToken = tokenDecoder(token) as { phone: string };

        // Если токен невалиден или из него не удалось извлечь данные
        if (!verifiedToken?.phone) { // Проверяем наличие phone после декодирования
            cookies().delete('token'); // Удаляем невалидный токен
            console.warn('Invalid or unverified token provided for /api/auth/me.');
            return NextResponse.json({ message: 'Invalid token or user data missing!' }, { status: 401 });
        }

        const userData = await UserModel.findOne({ phone: verifiedToken.phone }).lean();

        if (!userData) { // Проверяем, найден ли пользователь
            cookies().delete('token'); // Удаляем невалидный токен
            console.warn('User not found with provided token phone for /api/auth/me.');
            return NextResponse.json({ message: 'No user exist with this token data!' }, { status: 401 });
        }

        return NextResponse.json(userData, { status: 200 });

    } catch (err) {
        // Логирование ошибок для отладки
        console.error("Error in /api/auth/me API route:", err);
        // Добавьте этот блок, чтобы отлавливать SyntaxError, если он *все еще* возникает
        if (err instanceof SyntaxError) {
             console.error("JSON parsing error in /api/auth/me:", err.message);
             return NextResponse.json({ message: 'Invalid request body format (unexpected JSON error).' }, { status: 400 });
        }
        return NextResponse.json({ message: 'Unknown error, try later.' }, { status: 500 });
    }
}
