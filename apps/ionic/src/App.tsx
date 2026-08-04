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
import { Radar, Zap, Radio, Camera, MessageSquare, User } from 'lucide-react';

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
          <SafeRoute exact path="/">
            <SafeRedirect to="/feed" />
          </SafeRoute>
        </IonRouterOutlet>

        <IonTabBar slot="bottom" style={{ '--background': '#0b1120', '--border-color': 'rgba(255,255,255,0.08)', height: '68px' }}>
          <IonTabButton tab="feed" href="/feed" style={{ '--color': '#9ca3af', '--color-selected': '#00f2fe' }}>
            <Radar size={22} />
            <span style={{ fontSize: '10px', fontWeight: 700, marginTop: '3px' }}>Radar</span>
          </IonTabButton>

          <IonTabButton tab="sparks" href="/sparks" style={{ '--color': '#9ca3af', '--color-selected': '#ff0080' }}>
            <Zap size={22} />
            <span style={{ fontSize: '10px', fontWeight: 700, marginTop: '3px' }}>Sparks</span>
          </IonTabButton>

          <IonTabButton tab="lounges" href="/lounges" style={{ '--color': '#9ca3af', '--color-selected': '#00f2fe' }}>
            <Radio size={22} />
            <span style={{ fontSize: '10px', fontWeight: 700, marginTop: '3px' }}>Lounges</span>
          </IonTabButton>

          <IonTabButton tab="stories" href="/stories" style={{ '--color': '#9ca3af', '--color-selected': '#7928ca' }}>
            <Camera size={22} />
            <span style={{ fontSize: '10px', fontWeight: 700, marginTop: '3px' }}>Stories</span>
          </IonTabButton>

          <IonTabButton tab="chats" href="/chats" style={{ '--color': '#9ca3af', '--color-selected': '#00f2fe' }}>
            <MessageSquare size={22} />
            <span style={{ fontSize: '10px', fontWeight: 700, marginTop: '3px' }}>Chats</span>
          </IonTabButton>

          <IonTabButton tab="profile" href="/profile" style={{ '--color': '#9ca3af', '--color-selected': '#00f2fe' }}>
            <User size={22} />
            <span style={{ fontSize: '10px', fontWeight: 700, marginTop: '3px' }}>Profile</span>
          </IonTabButton>
        </IonTabBar>
      </IonTabs>
    </IonReactRouter>
  </IonApp>
);
