import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface PasswordInputProps {
  value: string;
  onChange: (value: string) => void;
}

const PasswordInput = ({ value, onChange }: PasswordInputProps) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="grid gap-2">
      <Label htmlFor="password">Senha</Label>
      <div className="relative">
        <Input
          id="password"
          type={showPassword ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoCapitalize="none"
          autoComplete="password"
          autoCorrect="off"
          className="w-80 sm:w-96 outline-none"
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-2 top-2 text-sm text-gray-500"
        >
          {showPassword ? 'Ocultar' : 'Mostrar'}
        </button>
      </div>
    </div>
  );
};

export default PasswordInput;
