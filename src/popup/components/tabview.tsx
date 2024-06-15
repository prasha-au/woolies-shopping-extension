import { useState } from 'react';

interface TabViewProps {
  tabs: Record<string, JSX.Element>;
}

export const TabView = (props: TabViewProps) => {
  const [activeTab, setActiveTab] = useState(Object.keys(props.tabs)[0]);

  return <div className="tabview">
    <div className="tabs">
      {props.tabs[activeTab]}
    </div>
    <div className="tab-headers">
      {Object.keys(props.tabs).map((tabName) => <div className={activeTab === tabName ? 'active' : ''} onClick={() => setActiveTab(tabName)}>{tabName}</div>)}
    </div>
  </div>;
};
