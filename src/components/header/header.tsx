import { Home, TicketPlus, User, } from 'lucide-react'

import { NavLink } from './nav-link'
export function Header() {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white shadow-md flex justify-center">
      <div className="flex h-16 items-center justify-between gap-6 px-6">
        <nav className="flex items-center  space-x-4 lg:space-x-6 gap-7">
          <NavLink to="/">
            <Home className="h-4 w-4" />
            Início
          </NavLink>
          <NavLink to="/orders">
            <TicketPlus className="h-4 w-4" />
            Tickets
          </NavLink>
          <NavLink to="/orders">
            <User className="h-4 w-4" />
            Perfil
          </NavLink>
        </nav>   
      </div>
    </div>
  )
}