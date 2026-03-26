import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/Header.css';

const Header: React.FC = () => {
  return (
    <header className="header">
      <div className="header-container">
        <Link to="/" className="logo">
          <span className="logo-icon">📝</span>
          <span className="logo-text">作业评审系统</span>
        </Link>
        <nav className="navbar">
          <ul className="nav-menu">
            <li><Link to="/" className="nav-link">首页</Link></li>
            <li><Link to="/history" className="nav-link">评审历史</Link></li>
            <li><Link to="/requirements" className="nav-link">要求库</Link></li>
            <li><Link to="/help" className="nav-link">帮助</Link></li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;