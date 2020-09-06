import React, { useEffect, useRef } from 'react';
import { Redirect } from 'react-router-dom';
import { Card, Typography, Layout, Spin } from 'antd';
import { useApolloClient, useMutation } from '@apollo/react-hooks';

import { Viewer } from '../../lib/types';
import {
  displayErrorMessage,
  displaySuccessNotification,
} from '../../lib/utils';
import { ErrorBanner } from '../../lib/components';
import { AUTH_URL } from '../../lib/graphql/queries';
import { AuthUrl as AuthUrlData } from '../../lib/graphql/queries/AuthUrl/__generated__/AuthUrl';
import { LOG_IN } from '../../lib/graphql/mutations';
import {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  LogIn as LogInData,
  LogInVariables,
} from '../../lib/graphql/mutations/LogIn/__generated__/LogIn';

// Image Assets
import googleLogo from './assets/google_logo.jpg';

interface Props {
  setViewer: (viewer: Viewer) => void;
}

const { Content } = Layout;
const { Text, Title } = Typography;

export const Login = ({ setViewer }: Props) => {
  const client = useApolloClient();
  const [
    logIn,
    { data: LogInData, loading: logInLoading, error: logInError },
  ] = useMutation<LogInData, LogInVariables>(LOG_IN, {
    onCompleted: (data) => {
      if (data && data.logIn && data.logIn.token) {
        setViewer(data.logIn);
        sessionStorage.setItem('token', data.logIn.token);
        displaySuccessNotification("You've successfully logged in!");
      }
    },
  });
  const logInRef = useRef(logIn);

  useEffect(() => {
    const code = new URL(window.location.href).searchParams.get('code');
    if (code) {
      logInRef.current({
        variables: {
          input: { code },
        },
      });
    }
  }, []);

  const handleAuthorize = async () => {
    try {
      const { data } = await client.query<AuthUrlData>({
        query: AUTH_URL,
      });
      window.location.href = data.authUrl;
    } catch {
      displayErrorMessage(
        "Sorry! We weren't able to log you in. Please try again!"
      );
    }
  };

  if (logInLoading) {
    return (
      <Content className="log-in">
        <Spin size="large" tip="Logging you in..." />
      </Content>
    );
  }

  if (LogInData && LogInData.logIn) {
    const { id: viewerId } = LogInData.logIn;
    return <Redirect to={`/user/${viewerId}`} />;
  }

  const logInErrorBannerElement = logInError ? (
    <ErrorBanner description="Sorry! We weren't able to log you in. Please try again!" />
  ) : null;

  return (
    <Content className="log-in">
      {logInErrorBannerElement}
      <Card className="log-in-card">
        <div className="log-in-card__intro">
          <Title level={3} className="log-in-card__intro-title">
            <span role="img" aria-label="wave">
              👋
            </span>
          </Title>
          <Title level={3} className="log-in-card__intro-title">
            Log in TinyHouse!
          </Title>
          <Text>Sign in with google to start booking rentals!</Text>
        </div>
        <button
          className="log-in-card__google-button"
          onClick={handleAuthorize}
        >
          <img
            src={googleLogo}
            alt="google-logo"
            className="log-in-card__google-button-logo"
          />
          <span className="log-in-card__google-button-card">
            Sign in with Google
          </span>
        </button>
        <Text type="secondary">
          Note: By signing in, you'll be redirected to the google consent form
          to sign in with your google account.
        </Text>
      </Card>
    </Content>
  );
};
