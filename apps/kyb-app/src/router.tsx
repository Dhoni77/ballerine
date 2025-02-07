import { withTokenProtected } from '@app/hocs/withTokenProtected';
import { CollectionFlow } from '@app/pages/CollectionFlow';
import { Approved } from '@app/pages/CollectionFlow/components/pages/Approved';
import { Rejected } from '@app/pages/CollectionFlow/components/pages/Rejected';
import { SignIn } from '@app/pages/SignIn';
import { createBrowserRouter } from 'react-router-dom';

import {
  createRoutesFromChildren,
  matchRoutes,
  useLocation,
  useNavigationType,
} from 'react-router-dom';
import * as Sentry from '@sentry/react';
import React from 'react';

export const sentyRouterInstrumentation = Sentry.reactRouterV6Instrumentation(
  React.useEffect,
  useLocation,
  useNavigationType,
  createRoutesFromChildren,
  matchRoutes,
);

const sentryCreateBrowserRouter = Sentry.wrapCreateBrowserRouter(createBrowserRouter);

export const router = sentryCreateBrowserRouter([
  {
    path: '/',
    Component: withTokenProtected(SignIn),
  },
  {
    path: '/collection-flow',
    Component: withTokenProtected(CollectionFlow),
  },
  {
    path: 'rejected',
    Component: withTokenProtected(Rejected),
  },
  {
    path: 'approved',
    Component: withTokenProtected(Approved),
  },
]);
