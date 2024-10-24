import { Outlet } from 'react-router-dom';

export const AuthLayout = () => {
  return (
    <div className="flex flex-col justify-center items-center min-h-screen w-full overflow-hidden bg-zinc-200">
      {/* Conteúdo centralizado */}
      <div className="flex justify-center items-center w-full h-full p-4">
        <Outlet />
      </div>
    </div>
  );
};

export default AuthLayout;
