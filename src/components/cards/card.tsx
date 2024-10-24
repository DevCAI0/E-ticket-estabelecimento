import { NavLink } from "react-router-dom"; // Ajuste do import para o React Router

interface CardProps {
  title: string;
  icon: React.ReactNode; // Ícone SVG ou imagem
  color: string; // Cor de fundo do card
  url: string; // URL para navegação
}

export const Card = ({ title, icon, color, url }: CardProps) => {
  return (
    <NavLink
      to={url}
      style={{ textDecoration: 'none' }} // Remove a sublinha padrão
      className="no-style" // Classe para remover outros estilos padrão
    >
      <div
        className="flex flex-col items-center justify-center p-4 rounded-lg"
        style={{ backgroundColor: color }}
      >
        <div className="mb-2">{icon}</div>
        <h3 className="text-black font-bold text-lg text-center">{title}</h3>
      </div>
    </NavLink>
  );
};
