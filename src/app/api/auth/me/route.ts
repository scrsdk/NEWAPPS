import connectToDB from "@/db/db";
import UserModel from "@/models/User";
import { tokenDecoder } from "@/utils";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server"; // Импортируем NextRequest и NextResponse

export const POST = async (req: NextRequest) => { // Используем NextRequest для лучшего типизирования
    try {
        await connectToDB();

        let token: string | undefined;

        // 1. Попытка получить токен из куки
        token = cookies().get('token')?.value;

        // 2. Если токена нет в куки, пытаемся получить его из заголовка Authorization
        if (!token) {
            const authorizationHeader = req.headers.get('Authorization');
            if (authorizationHeader?.startsWith('Bearer ')) {
                token = authorizationHeader.split(' ')[1];
            }
        }

        // 3. Если токена все еще нет, возвращаем ошибку
        if (!token) {
            return NextResponse.json({ message: 'Authentication token missing.' }, { status: 401 });
        }

        // Далее ваша логика обработки токена
        const verifiedToken = tokenDecoder(token) as { phone: string };

        const userData = await UserModel.findOne({ phone: verifiedToken?.phone }).lean();

        if (!userData || !verifiedToken) {
            cookies().delete('token'); // Удаляем невалидный токен
            return NextResponse.json({ message: 'Invalid token or user not found!' }, { status: 401 });
        }

        return NextResponse.json(userData, { status: 200 });

    } catch (err) {
        // Логирование ошибок для отладки
        console.error("Error in /api/auth/me:", err);
        // Отдельно обработайте SyntaxError, если он вдруг произойдет (например, если кто-то отправит мусор в теле)
        if (err instanceof SyntaxError) {
             return NextResponse.json({ message: 'Invalid request body format.' }, { status: 400 });
        }
        return NextResponse.json({ message: 'Unknown error, try later.' }, { status: 500 });
    }
}
