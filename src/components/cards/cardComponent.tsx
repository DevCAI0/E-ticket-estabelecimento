import { NavLink } from "react-router-dom"; // Ajuste do import para o React Router
import { Card } from "../ui/card";
interface CardProps {
  title: string;
  icon: React.ReactNode; // Ícone SVG ou imagem
  color: string; // Cor de fundo do card
  url: string; // URL para navegação
}

export const CardComponent = ({ title, icon, color, url }: CardProps) => {
  return (
    <NavLink
      to={url}
      style={{ textDecoration: "none" }} // Remove a sublinha padrão
      className="no-style" // Classe para remover outros estilos padrão
    >
      <Card
        className="flex md:flex-1  h-40 w-40 flex-col items-center justify-center rounded-lg p-4"
        style={{ backgroundColor: color }}
      >
        <div className="mb-2">{icon}</div>
        <h3 className="text-center text-sm font-bold text-black">{title}</h3>
      </Card>
    </NavLink>
  );
};
