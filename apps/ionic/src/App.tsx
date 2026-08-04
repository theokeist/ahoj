import React from 'react';
import { Redirect, Route } from 'react-router-dom';
import {
  IonApp,
  IonRouterOutlet,
  IonTabBar,
  IonTabButton,
  IonTabs,
  setupIonicReact
} from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { FeedPage } from './pages/FeedPage';
import { SparksPage } from './pages/SparksPage';
import { LoungesPage } from './pages/LoungesPage';
import { StoriesPage } from './pages/StoriesPage';
import { ChatsPage } from './pages/ChatsPage';
import { SafetyPage } from './pages/SafetyPage';
import { DealsPage } from './pages/DealsPage';
import { ProfilePage } from './pages/ProfilePage';
import { ComponentPalettePage } from './pages/ComponentPalettePage';
import { Radar, Zap, Radio, Camera, MessageSquare, User, Palette } from 'lucide-react';

/* Core CSS required for Ionic components to work properly */
import './theme/variables.css';

setupIonicReact({
  mode: 'ios'
});

const SafeRoute = Route as any;
const SafeRedirect = Redirect as any;

export const App: React.FC = () => (
  <IonApp>
    <IonReactRouter>
      <IonTabs>
        <IonRouterOutlet>
          <SafeRoute exact path="/feed" component={FeedPage} />
          <SafeRoute exact path="/sparks" component={SparksPage} />
          <SafeRoute exact path="/lounges" component={LoungesPage} />
          <SafeRoute exact path="/stories" component={StoriesPage} />
          <SafeRoute exact path="/chats" component={ChatsPage} />
          <SafeRoute exact path="/safety" component={SafetyPage} />
          <SafeRoute exact path="/deals" component={DealsPage} />
          <SafeRoute exact path="/profile" component={ProfilePage} />
          <SafeRoute exact path="/palette" component={ComponentPalettePage} />
          <SafeRoute exact path="/">
            <SafeRedirect to="/feed" />
          </SafeRoute>
        </IonRouterOutlet>

        {/* BlackBerry 10 Cascades Action Bar */}
        <IonTabBar
          slot="bottom"
          style={{
            '--background': '#080a0e',
            '--border-color': 'rgba(255, 255, 255, 0.12)',
            height: '66px',
            boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.1)'
          }}
        >
          <IonTabButton tab="feed" href="/feed" style={{ '--color': '#8e9aaf', '--color-selected': '#0099cc' }}>
            <Radar size={22} />
            <span style={{ fontSize: '10px', fontWeight: 700, marginTop: '3px', letterSpacing: '0.03em', textTransform: 'uppercase' }}>Radar</span>
          </IonTabButton>

          <IonTabButton tab="sparks" href="/sparks" style={{ '--color': '#8e9aaf', '--color-selected': '#ea4335' }}>
            <Zap size={22} />
            <span style={{ fontSize: '10px', fontWeight: 700, marginTop: '3px', letterSpacing: '0.03em', textTransform: 'uppercase' }}>Sparks</span>
          </IonTabButton>

          <IonTabButton tab="lounges" href="/lounges" style={{ '--color': '#8e9aaf', '--color-selected': '#0099cc' }}>
            <Radio size={22} />
            <span style={{ fontSize: '10px', fontWeight: 700, marginTop: '3px', letterSpacing: '0.03em', textTransform: 'uppercase' }}>Lounges</span>
          </IonTabButton>

          <IonTabButton tab="stories" href="/stories" style={{ '--color': '#8e9aaf', '--color-selected': '#0099cc' }}>
            <Camera size={22} />
            <span style={{ fontSize: '10px', fontWeight: 700, marginTop: '3px', letterSpacing: '0.03em', textTransform: 'uppercase' }}>Stories</span>
          </IonTabButton>

          <IonTabButton tab="chats" href="/chats" style={{ '--color': '#8e9aaf', '--color-selected': '#0099cc' }}>
            <MessageSquare size={22} />
            <span style={{ fontSize: '10px', fontWeight: 700, marginTop: '3px', letterSpacing: '0.03em', textTransform: 'uppercase' }}>Chats</span>
          </IonTabButton>

          <IonTabButton tab="profile" href="/profile" style={{ '--color': '#8e9aaf', '--color-selected': '#0099cc' }}>
            <User size={22} />
            <span style={{ fontSize: '10px', fontWeight: 700, marginTop: '3px', letterSpacing: '0.03em', textTransform: 'uppercase' }}>Profile</span>
          </IonTabButton>
        </IonTabBar>
      </IonTabs>
    </IonReactRouter>
  </IonApp>
);
