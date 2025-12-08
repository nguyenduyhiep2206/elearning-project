import React from 'react';
import Header from './Header';
import Footer from './Footer';

/**
 * Layout - Component layout chung cho các trang (có Header và Footer)
 */
const Layout = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default Layout;

