import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface EmailInputProps {
  value: string;
  onChange: (value: string) => void;
}

const EmailInput = ({ value, onChange }: EmailInputProps) => (
  <div className="grid gap-2">
    <Label htmlFor="email">Usuário</Label>
    <Input
      id="email"
      type="email"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      autoCapitalize="none"
      autoComplete="email"
      autoCorrect="off"
      placeholder='Infome seu usuário'
      className="w-80 sm:w-96 outline-none"

    />
  </div>
);

export default EmailInput;
