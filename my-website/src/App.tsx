import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Upload from './pages/Upload';
import Report from './pages/Report';
import History from './pages/History';
import HistoryRequirements from './pages/HistoryRequirements';
import Help from './pages/Help';
import './styles/App.css';

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <div className="app">
        <Header />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Upload />} />
            <Route path="/review" element={<Report />} />
            <Route path="/history" element={<History />} />
            <Route path="/requirements" element={<HistoryRequirements />} />
            <Route path="/help" element={<Help />} />
          </Routes>
        </main>
        <footer className="footer">
          <p>© 2026 英澳硕士作业评审系统 | <a href="#feedback">反馈</a> | <a href="/help">帮助</a></p>
        </footer>
      </div>
    </BrowserRouter>
  );
};

export default App;