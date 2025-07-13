import Chat from './components/Chat';
import { ThemeProvider } from './contexts/ThemeContext';
import { AIConfigProvider } from './contexts/AIConfigContext';
import './App.css';

function App() {
  return (
    <ThemeProvider>
      <AIConfigProvider>
        <div className="App">
          <Chat />
        </div>
      </AIConfigProvider>
    </ThemeProvider>
  );
}

export default App;
