import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from '@/components/ui/button';

import Logo from "@/assets/icons/icon.logo.svg"

export const SignIn = () => {
    return (
        <div className="flex justify-center flex-col items-center min-h-screen">
            <div className="flex flex-col items-center space-y-2 text-center">
                <img src={Logo} alt="Logo" className="w-16 h-16 object-contain" />
                <h1 className="text-2xl font-semibold tracking-tight ">
                    Food-Pass
                </h1>
            </div>

            <div className="grid gap-6 w-full max-w-md p-4">
                <form className="w-full">
                    <div className="grid gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="email">Seu e-mail</Label>
                            <Input
                                id="email"
                                type="email"
                                autoCapitalize="none"
                                autoComplete="email"
                                autoCorrect="off"
                                className="w-80 sm:w-96 outline-none "
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="password">Senha</Label>
                            <Input
                                id="password"
                                type="password"
                                autoCapitalize="none"
                                autoComplete="password"
                                autoCorrect="off"
                                className="w-80 sm:w-96  outline-none"
                            />
                        </div>
                        <Button type="submit" className="w-full bg-[#172554] text-white hover:bg-[#0f1e40]">
                            Acessar painel
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};
