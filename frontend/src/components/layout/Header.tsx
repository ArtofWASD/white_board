'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '../../lib/store/useAuthStore';
import { useTeamStore } from '../../lib/store/useTeamStore';
import Button from '../ui/Button';

interface HeaderProps {
  onRightMenuClick: () => void;
  onLeftMenuClick?: () => void;
  navItems?: { label: string; href: string; icon?: React.ReactNode; onClick?: () => void; tooltip?: string }[];
}

const Header: React.FC<HeaderProps> = ({ onRightMenuClick, onLeftMenuClick, navItems }) => {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated } = useAuthStore();
  const { teams, selectedTeam, selectTeam } = useTeamStore();

  const isDashboard = pathname?.startsWith('/dashboard') || pathname === '/calendar';

  const handleLoginClick = () => {
    router.push('/login');
  };

  const handleTitleClick = () => {
    router.push('/');
  };

  const handleUserIconClick = () => {
    router.push('/dashboard');
  };
  
  const handleNotificationsClick = () => {
    router.push('/notifications');
  };

  const handleTeamChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    selectTeam(e.target.value);
  };

  const [unreadCount, setUnreadCount] = React.useState(0);

  // WebSocket Integration
  React.useEffect(() => {
    if (isAuthenticated && user) {
        // Initial fetch
        const fetchUnreadCount = async () => {
             const { getUnreadNotificationCount } = await import('../../lib/api/notifications');
             const count = await getUnreadNotificationCount();
             setUnreadCount(count);
        };
        fetchUnreadCount();

        // Connect to Socket.IO
        // Note: Using a fixed URL for now, assumes backend on port 3001
        // In prod, this should come from env or be relative if proxied
        const { io } = require('socket.io-client');
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
        // Extract connection string from API_URL (fallback to 3001 if local)
        const socketUrl = 'http://localhost:3001'; 
        
        const socket = io(socketUrl);

        socket.on('connect', () => {
            console.log('Connected to WebSocket');
            socket.emit('joinUserRoom', user.id);
        });

        socket.on('newNotification', () => {
            console.log('New notification received');
            fetchUnreadCount(); // Refresh count on new notification
        });

        return () => {
            socket.disconnect();
        };
    }
  }, [isAuthenticated, user]);

  return (
    <header className="bg-gray-800 text-white py-2 px-2 sm:px-4 flex justify-between items-center relative gap-2 sm:gap-4">
      <div className="flex items-center">
        {isDashboard && (
          <button 
            onClick={onLeftMenuClick}
            className="lg:hidden mr-2 p-1 text-gray-300 hover:text-white focus:outline-none"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
            </svg>
          </button>
        )}
        {isDashboard ? (
          <Link href="/" className="ml-2 hidden lg:flex items-center">
            <Image src="/logo.png" alt="Logo" width={180} height={60} priority className="w-auto h-10 sm:h-14 object-contain" />
          </Link>
        ) : (
          <div className="h-10 sm:h-14 w-px"></div>
        )}
      </div>
      
      <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 flex items-center justify-center w-full max-w-2xl pointer-events-none lg:pointer-events-auto">
        <div className="pointer-events-auto">
        {navItems ? (
          <>
            <nav className="hidden lg:flex space-x-4">
              {navItems.map((item) => (
                item.icon ? (
                  <Button
                    key={item.label}
                    onClick={item.onClick}
                    href={item.href !== '#' ? item.href : undefined}
                    variant="ghost"
                    isIcon={true}
                    tooltip={item.tooltip}
                    className="text-white hover:text-blue-300"
                  >
                    {item.icon}
                  </Button>
                ) : (
                  item.onClick ? (
                    <button
                      key={item.label}
                      onClick={item.onClick}
                      className="text-white hover:text-blue-300 font-medium transition-colors bg-transparent border-none cursor-pointer text-base"
                    >
                      {item.label}
                    </button>
                  ) : (
                    <Link 
                      key={item.href} 
                      href={item.href}
                      className="text-white hover:text-blue-300 font-medium transition-colors"
                    >
                      {item.label}
                    </Link>
                  )
                )
              ))}
            </nav>
            {isDashboard && (
               <div className="lg:hidden flex flex-col items-center">
                 <Link href="/" className="flex items-center">
                   <Image src="/logo.png" alt="Logo" width={180} height={60} priority className="w-auto h-10 sm:h-14 object-contain" />
                 </Link>
                 {isAuthenticated && teams.length > 0 && selectedTeam && (
                    <div />
                 )}
               </div>
            )}
          </>
        ) : (
          !isDashboard ? (
            <Link href="/" onClick={handleTitleClick} className="flex items-center">
              <Image src="/logo.png" alt="Logo" width={180} height={60} className="h-10 sm:h-14 w-auto object-contain" />
            </Link>
          ) : (
             // Logo centered on mobile for dashboard
             <div className="flex flex-col items-center">
               <Link href="/" className="lg:hidden flex items-center">
                 <Image src="/logo.png" alt="Logo" width={180} height={60} priority className="w-auto h-10 sm:h-14 object-contain" />
               </Link>
               {isAuthenticated && teams.length > 0 && selectedTeam ? (
                 teams.length > 1 ? (
                   <div className="relative pointer-events-auto">
                     <select
                       value={selectedTeam.id}
                       onChange={handleTeamChange}
                       className="appearance-none bg-transparent text-white text-lg sm:text-xl font-bold py-1 px-4 pr-8 rounded cursor-pointer hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 border-none text-center"
                     >
                       {teams.map((team) => (
                         <option key={team.id} value={team.id} className="bg-gray-800 text-white">
                           {team.name}
                         </option>
                       ))}
                     </select>
                     <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-white">
                       <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                         <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                       </svg>
                     </div>
                   </div>
                 ) : (
                    null
                 )
               ) : (
                 <h1 
                   className="text-lg sm:text-xl font-bold cursor-pointer hover:text-gray-300 transition-colors"
                   onClick={handleTitleClick}
                 >
                   The Slate
                 </h1>
               )}
             </div>
          )
        )}
        </div>
      </div>

      {isAuthenticated && user ? (
        <div 
          className="flex items-center space-x-1 sm:space-x-4 cursor-pointer ml-auto"
        >
          <div className="relative group">
              <button 
                 onClick={handleNotificationsClick}
                 className="text-gray-300 hover:text-white transition-colors focus:outline-none relative"
                 aria-label="Notifications"
              >
                 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
                </svg>
                {unreadCount > 0 && (
                    <span className="absolute -bottom-1 -right-1 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] h-[18px] flex items-center justify-center border-2 border-gray-800">
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                )}
              </button>
              
              {/* Tooltip */}
              <div className="absolute top-full right-0 mt-2 w-max bg-gray-900 text-white text-xs px-2 py-1 rounded shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 pointer-events-none">
                  {unreadCount > 0 ? `${unreadCount} новых уведомлений` : 'Нет новых уведомлений'}
                  <div className="absolute -top-1 right-3 w-2 h-2 bg-gray-900 transform rotate-45"></div>
              </div>
          </div>
          
          <div onClick={handleUserIconClick} className="flex items-center space-x-1 sm:space-x-2">
            <span className="hidden lg:inline text-sm sm:text-base">Привет, {user.name}{user.lastName ? ` ${user.lastName}` : ''}!</span>
            <div className="w-[27px] h-[27px] sm:w-[35px] sm:h-[35px] rounded-full bg-blue-500 flex items-center justify-center">
              <span className="font-bold text-sm sm:text-base">{user.name.charAt(0)}{user.lastName ? user.lastName.charAt(0) : ''}</span>
            </div>
          </div>
        </div>
      ) : (
        <button 
          onClick={handleLoginClick}
          className="bg-transparent hover:bg-transparent text-white font-bold p-2 sm:p-3 rounded-full cursor-pointer ml-auto"
        >
          <Image src="/login.png" alt="Login" width={27} height={27} className="sm:w-[35px] sm:h-[35px]" />
        </button>
      )}
    </header>
  );
};

export default Header;