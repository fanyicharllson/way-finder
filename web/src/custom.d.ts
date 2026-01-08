declare module '*.jsx' {
  import type { ComponentType } from 'react';
  const Component: ComponentType<any>;
  export default Component;
}

declare module '*.js' {
  import type { ComponentType } from 'react';
  const Component: ComponentType<any>;
  export default Component;
}

// Specific module declaration for App.jsx (optional but explicit)
declare module './App' {
  import type { ComponentType } from 'react';
  const App: ComponentType<any>;
  export default App;
}