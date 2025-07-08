import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div style={{ 
        minHeight: '100vh', 
        backgroundColor: '#1a1a1a', 
        color: '#fff', 
        padding: '20px',
        fontFamily: 'Arial, sans-serif'
      }}>
        <h1>ProFlix Test</h1>
        <p>✅ React is working!</p>
        <p>If you see this message, the React app is successfully mounting.</p>
        <div style={{ 
          padding: '20px', 
          backgroundColor: '#2a2a2a', 
          borderRadius: '8px', 
          margin: '20px 0' 
        }}>
          <h3>Server Connection Test</h3>
          <TestComponent />
        </div>
      </div>
    </QueryClientProvider>
  );
}

function TestComponent() {
  return (
    <div>
      <p>✅ Components are rendering</p>
      <p>This confirms React is working in production mode.</p>
    </div>
  );
}