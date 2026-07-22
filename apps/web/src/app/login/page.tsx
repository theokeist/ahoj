"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Form, Input, Button, App, Divider } from "antd";
import {
  UserOutlined,
  LockOutlined,
  GlobalOutlined,
  ThunderboltOutlined,
} from "@ant-design/icons";
import { ThemeProvider } from "../../components/ThemeProvider";
import { OAuthProviderGrid, type OAuthProviderKey } from "../../components/OAuthProviderGrid";

/**
 * LoginPage — all colors/spacing/radius use CSS variables from globals.css
 * Strictly aligned to mobile theme.ts tokens
 */
function LoginForm() {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const { message } = App.useApp();

  const handleEmailLogin = async (values: any) => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:3000/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Login failed");
      message.success(`Welcome back, ${data.user.username}!`);
      localStorage.setItem("accessToken", data.accessToken);
      window.location.href = "/app";
    } catch (err: any) {
      message.error(err.message || "Unable to sign in");
    } finally {
      setLoading(false);
    }
  };

  const handleInstantDemoLogin = async () => {
    form.setFieldsValue({ email: "dev@ahoj.app", password: "password123" });
    handleEmailLogin({ email: "dev@ahoj.app", password: "password123" });
  };

  const handleOAuthLogin = async (provider: OAuthProviderKey) => {
    setLoading(true);
    message.loading({ content: `Connecting to ${provider.toUpperCase()}...`, key: "oauth" });
    const mockProviderId = `${provider}_user_${Math.floor(100000 + Math.random() * 900000)}`;
    const mockUsername = `${provider}_user`;
    const mockEmail = provider === "wechat" ? null : `${mockUsername}@example.com`;
    const mockBio = provider === "line" ? "Exploring nearby spots on ahoj 📍" : null;
    const mockAvatarUrl = `https://api.dicebear.com/7.x/bottts/svg?seed=${mockUsername}`;
    try {
      const res = await fetch("http://localhost:3000/auth/oauth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider, providerUserId: mockProviderId, email: mockEmail, username: mockUsername, avatarUrl: mockAvatarUrl, bio: mockBio }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "OAuth sign-in failed");
      message.success({ content: `Signed in via ${provider.toUpperCase()} as @${data.user.username}!`, key: "oauth" });
      localStorage.setItem("accessToken", data.accessToken);
      window.location.href = "/app";
    } catch (err: any) {
      message.error({ content: err.message || "OAuth authentication failed", key: "oauth" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100dvh",
        width: "100%",
        display: "flex",
        backgroundColor: "var(--bg-primary)",
        color: "var(--text-primary)",
      }}
    >
      {/* ── Left: Radar Atmosphere ─────────────────────────────── */}
      <div
        style={{
          display: "none",
          flex: "0 0 60%",
          position: "relative",
          overflow: "hidden",
          background: "linear-gradient(135deg, var(--bg-primary) 0%, #0A192F 60%, #052930 100%)",
          alignItems: "center",
          justifyContent: "center",
          padding: "var(--space-xxl)",
          borderRight: "1px solid var(--border-light)",
        }}
        className="lg:flex"
      >
        {/* Radial glow */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "radial-gradient(circle at center, rgba(0,242,254,0.12) 0, transparent 70%)",
            pointerEvents: "none",
          }}
        />

        {/* Radar rings */}
        <div style={{ position: "relative", width: 320, height: 320, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div
            className="animate-radar"
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: "50%",
              border: "1px solid rgba(0,242,254,0.20)",
            }}
          />
          <div
            style={{
              position: "absolute",
              width: 240,
              height: 240,
              borderRadius: "50%",
              border: "1px solid rgba(0,242,254,0.30)",
              animation: "pulse 2s cubic-bezier(0.4,0,0.6,1) infinite",
            }}
          />
          <div
            style={{
              position: "absolute",
              width: 160,
              height: 160,
              borderRadius: "50%",
              border: "1px solid rgba(0,242,254,0.40)",
            }}
          />
          <div
            style={{
              width: 80,
              height: 80,
              borderRadius: "50%",
              backgroundColor: "rgba(0,242,254,0.10)",
              border: "1px solid var(--color-primary)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 0 30px rgba(0,242,254,0.40)",
            }}
          >
            <span style={{ fontSize: "var(--text-lg)", fontWeight: 900, color: "var(--color-primary)" }}>/A\</span>
          </div>
        </div>

        {/* Bottom info panel */}
        <div
          className="glass-panel"
          style={{
            position: "absolute",
            bottom: "var(--space-xxl)",
            left: "var(--space-xxl)",
            right: "var(--space-xxl)",
            borderRadius: "var(--radius-xl)",
            padding: "var(--space-lg)",
            zIndex: 10,
          }}
        >
          <h2 style={{ fontSize: "var(--text-xl)", fontWeight: 700, color: "var(--text-primary)", marginBottom: "var(--space-sm)" }}>
            <GlobalOutlined style={{ color: "var(--color-primary)", marginRight: "var(--space-sm)" }} />
            Global Proximity Network
          </h2>
          <p style={{ fontSize: "var(--text-sm)", color: "var(--text-secondary)", margin: 0 }}>
            Discover people, spontaneous meetups, and real-time stories happening right next to you.
          </p>
        </div>
      </div>

      {/* ── Right: Auth Form ───────────────────────────────────── */}
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "var(--space-xl)",
        }}
      >
        <div style={{ width: "100%", maxWidth: 420, display: "flex", flexDirection: "column", gap: "var(--space-lg)" }}>

          {/* Logo Header */}
          <div style={{ textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: "var(--space-sm)" }}>
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: "var(--radius-lg)",
                backgroundColor: "rgba(0,242,254,0.10)",
                border: "1px solid var(--border)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "var(--text-md)",
                fontWeight: 900,
                color: "var(--color-primary)",
              }}
            >
              /A\
            </div>
            <h1 style={{ fontSize: "var(--text-xl)", fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>Sign in to ahoj</h1>
            <p style={{ fontSize: "var(--text-sm)", color: "var(--text-tertiary)", margin: 0 }}>
              Use 1-click Demo Login or enter your credentials
            </p>
          </div>

          {/* Demo Login CTA */}
          <button
            type="button"
            onClick={handleInstantDemoLogin}
            disabled={loading}
            className="btn-primary"
            style={{ width: "100%", padding: "var(--space-md)", fontSize: "var(--text-sm)", borderRadius: "var(--radius-lg)" }}
          >
            <ThunderboltOutlined style={{ fontSize: 16 }} />
            ⚡ Instant Demo Sign-In (@dev_user)
          </button>

          {/* Glass Form Container */}
          <div
            className="glass-panel"
            style={{
              borderRadius: "var(--radius-xl)",
              padding: "var(--space-xl)",
              display: "flex",
              flexDirection: "column",
              gap: "var(--space-md)",
            }}
          >
            <Form form={form} layout="vertical" onFinish={handleEmailLogin} requiredMark={false}>
              <Form.Item
                name="email"
                rules={[
                  { required: true, message: "Please input your email!" },
                  { type: "email", message: "Please enter a valid email!" },
                ]}
                style={{ marginBottom: "var(--space-md)" }}
              >
                <Input
                  prefix={<UserOutlined style={{ color: "var(--text-disabled)" }} />}
                  placeholder="Email address"
                  size="large"
                />
              </Form.Item>

              <Form.Item
                name="password"
                rules={[{ required: true, message: "Please input your password!" }]}
                style={{ marginBottom: "var(--space-md)" }}
              >
                <Input.Password
                  prefix={<LockOutlined style={{ color: "var(--text-disabled)" }} />}
                  placeholder="Password"
                  size="large"
                />
              </Form.Item>

              <Button type="primary" htmlType="submit" loading={loading} block size="large">
                Sign In with Email
              </Button>
            </Form>

            <Divider style={{ margin: "var(--space-sm) 0" }}>
              <span style={{ fontSize: "var(--text-xs)", color: "var(--text-tertiary)" }}>Or continue with Global OAuth</span>
            </Divider>

            <OAuthProviderGrid onSelectProvider={handleOAuthLogin} loading={loading} />
          </div>

          <p style={{ textAlign: "center", fontSize: "var(--text-xs)", color: "var(--text-tertiary)", margin: 0 }}>
            Don&apos;t have an account?{" "}
            <Link
              href="/register"
              style={{ color: "var(--color-primary)", textDecoration: "none", fontWeight: 600 }}
            >
              Create one now
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <ThemeProvider>
      <App>
        <LoginForm />
      </App>
    </ThemeProvider>
  );
}
