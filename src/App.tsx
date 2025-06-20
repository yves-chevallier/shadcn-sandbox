import Layout from "@/layout/Layout";
import { ThemeProvider } from "@/providers/ThemeProvider";
function App() {
  return (
    <ThemeProvider>
      <Layout />
    </ThemeProvider>
  );
}

export default App;
