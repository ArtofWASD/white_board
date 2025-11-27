import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useTeam } from '../../contexts/TeamContext';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { HeaderProps } from '../../types/Header.types';


const Header: React.FC<HeaderProps> = ({ onLeftMenuClick }) => {
  const { user, isAuthenticated } = useAuth();
  const { teams, selectedTeam, selectTeam } = useTeam();
  const router = useRouter();

  const handleLoginClick = () => {
    router.push('/login');
  };

  const handleTitleClick = () => {
    router.push('/');
  };

  const handleUserIconClick = () => {
    router.push('/dashboard');
  };

  const handleTeamChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    selectTeam(e.target.value);
  };

  return (
    <header className="bg-gray-800 text-white py-2 px-2 sm:px-4 flex justify-between items-center relative">
      <button 
        onClick={onLeftMenuClick}
        className="bg-transparent hover:bg-transparent text-white font-bold p-2 sm:p-3 rounded-full cursor-pointer"
        aria-label="Menu"
      >
        <Image src="/menu.png" alt="Menu" width={32} height={32} className="sm:w-10 sm:h-10" />
      </button>
      
      <div className="absolute left-1/2 transform -translate-x-1/2 flex items-center justify-center">
        {isAuthenticated && teams.length > 0 && selectedTeam ? (
          teams.length > 1 ? (
            <div className="relative">
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
            <h1 
              className="text-lg sm:text-xl font-bold cursor-pointer hover:text-gray-300 transition-colors"
              onClick={handleTitleClick}
            >
              {selectedTeam.name}
            </h1>
          )
        ) : (
          <h1 
            className="text-lg sm:text-xl font-bold cursor-pointer hover:text-gray-300 transition-colors"
            onClick={handleTitleClick}
          >
            My White Board
          </h1>
        )}
      </div>

      {isAuthenticated && user ? (
        <div 
          className="flex items-center space-x-1 sm:space-x-2 cursor-pointer"
          onClick={handleUserIconClick}
        >
          <span className="hidden md:inline text-sm sm:text-base">Привет, {user.name}{user.lastName ? ` ${user.lastName}` : ''}!</span>
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-blue-500 flex items-center justify-center">
            <span className="font-bold text-sm sm:text-base">{user.name.charAt(0)}{user.lastName ? user.lastName.charAt(0) : ''}</span>
          </div>
        </div>
      ) : (
        <button 
          onClick={handleLoginClick}
          className="bg-transparent hover:bg-transparent text-white font-bold p-2 sm:p-3 rounded-full cursor-pointer"
        >
          <Image src="/login.png" alt="Login" width={32} height={32} className="sm:w-10 sm:h-10" />
        </button>
      )}
    </header>
  );
};

export default Header;