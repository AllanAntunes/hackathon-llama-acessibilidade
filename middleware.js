import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export default async function middleware(request) {
    const cookieStore = await cookies();
    const token = cookieStore.get("token");

    let protectedRoutes = ["/admin"];
    let publicRoutes = ["/login", "/"];

    if (protectedRoutes.includes(request.nextUrl.pathname) && !token) {
        return NextResponse.redirect(new URL("/login", request.url));
    }

    if(token && request.nextUrl.pathname === "/login") {
        return NextResponse.redirect(new URL("/admin", request.url));
    }
    
}
