import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import Header from './components/Header';
import Upload from './pages/Upload';
import Report from './pages/Report';
import History from './pages/History';
import HistoryRequirements from './pages/HistoryRequirements';
import Help from './pages/Help';
import './styles/App.css';

const App: React.FC = () => {
  return (
    <Router>
      <div className="app">
        <Header />
        <main className="main-content">
          <Switch>
            <Route path="/" exact component={Upload} />
            <Route path="/review" component={Report} />
            <Route path="/history" component={History} />
            <Route path="/requirements" component={HistoryRequirements} />
            <Route path="/help" component={Help} />
          </Switch>
        </main>
        <footer className="footer">
          <p>© 2026 英澳硕士作业评审系统 | <a href="#feedback">反馈</a> | <a href="/help">帮助</a></p>
        </footer>
      </div>
    </Router>
  );
};

export default App;