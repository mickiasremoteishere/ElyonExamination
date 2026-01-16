import { Outlet } from 'react-router-dom';
import HorizontalNavbar from './HorizontalNavbar';

const SuperadminLayout = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Horizontal Navigation Bar */}
      <HorizontalNavbar />
      
      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pt-4 pb-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <Outlet />
          </div>
        </div>
      </main>
      
      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-4 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-gray-500">
            &copy; {new Date().getFullYear()} Elyon Examination System. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default SuperadminLayout;
