import React, { useState } from 'react';
import Home from './components/Home';
import Reportes from './components/Reportes';
import Usuarios from './components/Usuarios';
import Perfil from './components/Perfil';
import Ajustes from './components/Ajustes';

function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return <Home />;
      case 'reportes':
        return <Reportes />;
      case 'usuarios':
        return <Usuarios />;
      case 'perfil':
        return <Perfil />;
      case 'ajustes':
        return <Ajustes />;
      default:
        return <Home />;
    }
  };

  const getPageTitle = () => {
    switch (activeTab) {
      case 'home':
        return 'Dashboard';
      case 'reportes':
        return 'Reportes';
      case 'usuarios':
        return 'Usuarios';
      case 'perfil':
        return 'Perfil';
      case 'ajustes':
        return 'Ajustes';
      default:
        return 'Dashboard';
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex border border-blue-500/20">
      {/* Mobile Header with Menu Button and Page Title */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-gray-800 border-b border-gray-700 px-4 py-3 flex items-center justify-between">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <h1 className="text-white text-lg font-semibold">{getPageTitle()}</h1>
        <div className="w-10"></div> {/* Spacer for centering */}
      </div>

      {/* Left Sidebar */}
      <div className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-40 w-72 bg-gray-800 transition-transform duration-300 ease-in-out lg:transition-none lg:w-64`}>
        {/* Header with Logo */}
        <div className="p-6 border-b border-gray-700">
          <div className="flex flex-col items-center space-y-2">
            {/* Logo Icon - Car with Building */}
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center relative">
              {/* Building silhouette */}
              <svg className="w-5 h-5 text-white absolute bottom-0" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2L2 7v10c0 5.55 3.84 10 9 11 1.16-.21 2.31-.48 3.29-.86L14 14h3V7l-9-5z"/>
              </svg>
              {/* Car icon */}
              <svg className="w-4 h-4 text-white absolute top-1 right-1" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/>
              </svg>
              {/* Checkmark overlay */}
              <svg className="w-3 h-3 text-white absolute top-0 left-0" fill="currentColor" viewBox="0 0 24 24">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
              </svg>
            </div>
            <span className="text-white text-xl font-bold">InfraCheck</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4">
          <ul className="space-y-2">
            <li>
              <button
                onClick={() => {
                  setActiveTab('home');
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  activeTab === 'home' ? 'text-white bg-blue-600/20 border border-blue-600/30' : 'text-gray-300 hover:text-white hover:bg-gray-700'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                <span>Home</span>
              </button>
            </li>
            <li>
              <button
                onClick={() => {
                  setActiveTab('reportes');
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  activeTab === 'reportes' ? 'text-white bg-blue-600/20 border border-blue-600/30' : 'text-gray-300 hover:text-white hover:bg-gray-700'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span>Reportes</span>
              </button>
            </li>
            <li>
              <button
                onClick={() => {
                  setActiveTab('usuarios');
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  activeTab === 'usuarios' ? 'text-white bg-blue-600/20 border border-blue-600/30' : 'text-gray-300 hover:text-white hover:bg-gray-700'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
                <span>Usuarios</span>
              </button>
            </li>
            <li>
              <button
                onClick={() => {
                  setActiveTab('perfil');
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  activeTab === 'perfil' ? 'text-white bg-blue-600/20 border border-blue-600/30' : 'text-gray-300 hover:text-white hover:bg-gray-700'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span>Perfil</span>
              </button>
            </li>
            <li>
              <button
                onClick={() => {
                  setActiveTab('ajustes');
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  activeTab === 'ajustes' ? 'text-white bg-blue-600/20 border border-blue-600/30' : 'text-gray-300 hover:text-white hover:bg-gray-700'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>Ajustes</span>
              </button>
            </li>
          </ul>
        </nav>

        {/* User Profile - Fixed positioning */}
        <div className="absolute bottom-6 left-6 right-6">
          <div className="flex items-center space-x-3 p-3 bg-gray-700 rounded-lg">
            <div className="w-10 h-10 bg-gray-500 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <span className="text-white text-sm">Persona</span>
          </div>
        </div>
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content Area */}
      <div className="flex-1 overflow-auto lg:ml-0 pt-16 lg:pt-0">
        {renderContent()}
      </div>
    </div>
  );
}

export default App; 