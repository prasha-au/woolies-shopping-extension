import { createRoot } from 'react-dom/client';
import { TabView } from './components/tabview';
import { ShoppingList } from './components/shoppinglist';
import { SpecialsList } from './components/specialslist';


function App() {
  return <>
    <TabView tabs={{
      'Shopping List': <ShoppingList />,
      'Specials': <SpecialsList />,
    }} />
  </>;
}

const root = createRoot(document.getElementById('root') as HTMLElement);
root.render(<App />);
