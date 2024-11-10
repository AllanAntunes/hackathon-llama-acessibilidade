"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Image from "next/image";

const LoginPage = () => {
    const router = useRouter();
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        
        try {
            // Create fake token
            const fakeToken = "fake_token_" + Math.random().toString(36).substring(7);
            
            // Set token in cookie
            document.cookie = `token=${fakeToken}; path=/`;
            
            // Redirect to admin page
            router.push("/admin");
        } catch (err) {
            setError("Ocorreu um erro ao fazer login. Tente novamente.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100">
            <div className="max-w-md w-full space-y-8 p-10 bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl">
                <div className="text-center">
                    <div className="mx-auto w-24 h-24 relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl transform rotate-6 transition-transform group-hover:rotate-12" />
                        <div className="absolute inset-0 bg-white rounded-xl shadow-inner flex items-center justify-center">
                            {/* You can add your logo here */}
                            <span className="text-3xl">🔐</span>
                        </div>
                    </div>
                    <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
                        Bem-vindo de volta
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        Faça login para acessar sua conta
                    </p>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                E-mail
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                required
                                className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                placeholder="seu@email.com"
                            />
                        </div>
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                Senha
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                required
                                className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                placeholder="Sua senha"
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="text-red-500 text-sm text-center bg-red-50 p-3 rounded-lg">
                            {error}
                        </div>
                    )}

                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <input
                                id="remember-me"
                                name="remember-me"
                                type="checkbox"
                                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                            />
                            <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                                Lembrar-me
                            </label>
                        </div>

                        <div className="text-sm">
                            <a href="#" className="font-medium text-indigo-600 hover:text-indigo-500">
                                Esqueceu a senha?
                            </a>
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-150 disabled:opacity-70"
                        >
                            {loading ? (
                                <span className="flex items-center">
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Entrando...
                                </span>
                            ) : (
                                "Entrar"
                            )}
                        </button>
                    </div>
                </form>

                <div className="text-center text-sm">
                    <span className="text-gray-600">Não tem uma conta? </span>
                    <a href="#" className="font-medium text-indigo-600 hover:text-indigo-500">
                        Cadastre-se
                    </a>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
