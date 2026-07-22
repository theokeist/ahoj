"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Form, Input, Button, App, Divider, DatePicker } from "antd";
import { UserOutlined, MailOutlined, LockOutlined } from "@ant-design/icons";
import { ThemeProvider } from "../../components/ThemeProvider";
import { OAuthProviderGrid, type OAuthProviderKey } from "../../components/OAuthProviderGrid";

/**
 * RegisterPage — all colors/spacing/radius use CSS variables from globals.css
 * Strictly aligned to mobile theme.ts tokens
 */
function RegisterForm() {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const { message } = App.useApp();

  const handleRegister = async (values: any) => {
    setLoading(true);
    try {
      const payload = {
        username: values.username,
        email: values.email,
        password: values.password,
        dateOfBirth: values.dateOfBirth ? values.dateOfBirth.format("YYYY-MM-DD") : undefined,
      };
      const res = await fetch("http://localhost:3000/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Registration failed");
      message.success(`Account created! Welcome to ahoj, @${data.user.username}!`);
      localStorage.setItem("accessToken", data.accessToken);
      window.location.href = "/app";
    } catch (err: any) {
      message.error(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const handleOAuthRegister = async (provider: OAuthProviderKey) => {
    setLoading(true);
    message.loading({ content: `Connecting to ${provider.toUpperCase()}...`, key: "oauth" });
    const mockProviderId = `${provider}_user_${Math.floor(100000 + Math.random() * 900000)}`;
    const mockUsername = `${provider}_${Math.floor(1000 + Math.random() * 9000)}`;
    const mockEmail = provider === "wechat" ? null : `${mockUsername}@example.com`;
    const mockBio = provider === "line" ? "Exploring nearby spots on ahoj 📍" : "Hello from " + provider.toUpperCase();
    const mockAvatarUrl = `https://api.dicebear.com/7.x/bottts/svg?seed=${mockUsername}`;
    try {
      const res = await fetch("http://localhost:3000/auth/oauth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider, providerUserId: mockProviderId, email: mockEmail, username: mockUsername, avatarUrl: mockAvatarUrl, bio: mockBio }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "OAuth sign-up failed");
      message.success({ content: `Registered via ${provider.toUpperCase()} as @${data.user.username}!`, key: "oauth" });
      localStorage.setItem("accessToken", data.accessToken);
      window.location.href = "/app";
    } catch (err: any) {
      message.error({ content: err.message || "OAuth registration failed", key: "oauth" });
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
      {/* Left: Radar Atmosphere */}
      <div
        style={{
          display: "none",
          flex: "0 0 50%",
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
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "radial-gradient(circle at center, rgba(0,242,254,0.12) 0, transparent 70%)",
            pointerEvents: "none",
          }}
        />
        <div style={{ position: "relative", width: 280, height: 280, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div className="animate-radar" style={{ position: "absolute", inset: 0, borderRadius: "50%", border: "1px solid rgba(0,242,254,0.20)" }} />
          <div style={{ position: "absolute", width: 200, height: 200, borderRadius: "50%", border: "1px solid rgba(0,242,254,0.30)" }} />
          <div style={{
            width: 72, height: 72, borderRadius: "50%",
            backgroundColor: "rgba(0,242,254,0.10)",
            border: "1px solid var(--color-primary)",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 0 30px rgba(0,242,254,0.40)",
          }}>
            <span style={{ fontSize: "var(--text-lg)", fontWeight: 900, color: "var(--color-primary)" }}>/A\</span>
          </div>
        </div>

        <div
          className="glass-panel"
          style={{
            position: "absolute",
            bottom: "var(--space-xxl)",
            left: "var(--space-xxl)",
            right: "var(--space-xxl)",
            borderRadius: "var(--radius-xl)",
            padding: "var(--space-lg)",
          }}
        >
          <h3 style={{ fontSize: "var(--text-lg)", fontWeight: 700, color: "var(--text-primary)", marginBottom: "var(--space-xs)" }}>Join the Radar</h3>
          <p style={{ fontSize: "var(--text-sm)", color: "var(--text-secondary)", margin: 0 }}>
            Create an account with custom username, optional bio, avatar, or use one-click global OAuth providers.
          </p>
        </div>
      </div>

      {/* Right: Registration Form */}
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "var(--space-xl)",
          overflowY: "auto",
        }}
      >
        <div style={{ width: "100%", maxWidth: 420, display: "flex", flexDirection: "column", gap: "var(--space-lg)" }}>

          {/* Logo Header */}
          <div style={{ textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: "var(--space-sm)" }}>
            <div
              style={{
                width: 48, height: 48,
                borderRadius: "var(--radius-lg)",
                backgroundColor: "rgba(0,242,254,0.10)",
                border: "1px solid var(--border)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "var(--text-md)", fontWeight: 900, color: "var(--color-primary)",
              }}
            >
              /A\
            </div>
            <h1 style={{ fontSize: "var(--text-xl)", fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>Create your ahoj account</h1>
            <p style={{ fontSize: "var(--text-sm)", color: "var(--text-tertiary)", margin: 0 }}>
              Join nearby friends and local spontaneous meetups
            </p>
          </div>

          {/* Glass Form */}
          <div className="glass-panel" style={{ borderRadius: "var(--radius-xl)", padding: "var(--space-xl)", display: "flex", flexDirection: "column", gap: "var(--space-md)" }}>
            <Form form={form} layout="vertical" onFinish={handleRegister} requiredMark={false}>
              <Form.Item
                name="username"
                rules={[
                  { required: true, message: "Username is required!" },
                  { pattern: /^[a-zA-Z0-9_]+$/, message: "Letters, numbers & underscores only!" },
                ]}
                style={{ marginBottom: "var(--space-md)" }}
              >
                <Input prefix={<UserOutlined style={{ color: "var(--text-disabled)" }} />} placeholder="Username (e.g. alex_24)" size="large" />
              </Form.Item>

              <Form.Item
                name="email"
                rules={[
                  { required: true, message: "Email is required!" },
                  { type: "email", message: "Valid email address required!" },
                ]}
                style={{ marginBottom: "var(--space-md)" }}
              >
                <Input prefix={<MailOutlined style={{ color: "var(--text-disabled)" }} />} placeholder="Email address" size="large" />
              </Form.Item>

              <Form.Item
                name="password"
                rules={[{ required: true, min: 8, message: "Min 8 characters required!" }]}
                style={{ marginBottom: "var(--space-md)" }}
              >
                <Input.Password prefix={<LockOutlined style={{ color: "var(--text-disabled)" }} />} placeholder="Password (8+ chars)" size="large" />
              </Form.Item>

              <Form.Item
                name="dateOfBirth"
                label={<span style={{ fontSize: "var(--text-xs)", color: "var(--text-secondary)" }}>Date of Birth (Optional)</span>}
                style={{ marginBottom: "var(--space-md)" }}
              >
                <DatePicker style={{ width: "100%" }} placeholder="Select your birth date" size="large" />
              </Form.Item>

              <Button type="primary" htmlType="submit" loading={loading} block size="large">
                Create Account
              </Button>
            </Form>

            <Divider style={{ margin: "var(--space-sm) 0" }}>
              <span style={{ fontSize: "var(--text-xs)", color: "var(--text-tertiary)" }}>Or Register with Global Identity</span>
            </Divider>

            <OAuthProviderGrid onSelectProvider={handleOAuthRegister} loading={loading} />
          </div>

          <p style={{ textAlign: "center", fontSize: "var(--text-xs)", color: "var(--text-tertiary)", margin: 0 }}>
            Already have an account?{" "}
            <Link href="/login" style={{ color: "var(--color-primary)", textDecoration: "none", fontWeight: 600 }}>
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <ThemeProvider>
      <App>
        <RegisterForm />
      </App>
    </ThemeProvider>
  );
}
