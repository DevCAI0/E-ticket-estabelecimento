import { Header } from '@/components/header/header';
import { Outlet } from 'react-router-dom';

export const AppLayout = () => {
  return (
    <div className="flex flex-col min-h-screen w-full overflow-hidden bg-gray-200">
      {/* Conteúdo principal */}
      <div className="flex-1 w-full p-4 overflow-auto">
      
         <Outlet />
      
      </div>

      {/* Barra de navegação inferior para Mobile */}
      <div className="fixed bottom-0 w-full">
        <Header />
      </div>
    </div>
  );
};

export default AppLayout;
