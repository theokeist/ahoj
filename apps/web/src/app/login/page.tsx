"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Form, Input, Button, message, Divider } from "antd";
import { UserOutlined, LockOutlined, GlobalOutlined, ThunderboltOutlined } from "@ant-design/icons";
import { ThemeProvider } from "../../components/ThemeProvider";
import { OAuthProviderGrid, type OAuthProviderKey } from "../../components/OAuthProviderGrid";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

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
      window.location.href = "/";
    } catch (err: any) {
      message.error(err.message || "Unable to sign in");
    } finally {
      setLoading(false);
    }
  };

  const handleInstantDemoLogin = async () => {
    form.setFieldsValue({
      email: "dev@ahoj.app",
      password: "password123",
    });
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
        body: JSON.stringify({
          provider,
          providerUserId: mockProviderId,
          email: mockEmail,
          username: mockUsername,
          avatarUrl: mockAvatarUrl,
          bio: mockBio,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "OAuth sign-in failed");

      message.success({ content: `Signed in via ${provider.toUpperCase()} as @${data.user.username}!`, key: "oauth" });
      localStorage.setItem("accessToken", data.accessToken);
      window.location.href = "/";
    } catch (err: any) {
      message.error({ content: err.message || "OAuth authentication failed", key: "oauth" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemeProvider>
      <div className="min-h-screen w-full flex bg-[#0C0C0C] text-white">
        {/* Left Side: Dynamic Visual Radar Atmosphere */}
        <div className="hidden lg:flex lg:w-3/5 relative overflow-hidden bg-gradient-to-br from-[#0C0C0C] via-[#0A192F] to-[#052930] items-center justify-center p-12 border-r border-white/10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,242,254,0.12)_0,transparent_70%)] pointer-events-none" />

          {/* Radar Circles */}
          <div className="relative w-96 h-96 flex items-center justify-center">
            <div className="absolute inset-0 rounded-full border border-[#00F2FE]/20 animate-radar" />
            <div className="absolute w-72 h-72 rounded-full border border-[#00F2FE]/30 animate-pulse" />
            <div className="absolute w-48 h-48 rounded-full border border-[#00F2FE]/40" />
            <div className="w-24 h-24 rounded-full bg-[#00F2FE]/10 border border-[#00F2FE] flex items-center justify-center shadow-[0_0_30px_rgba(0,242,254,0.4)]">
              <span className="text-2xl font-bold text-[#00F2FE]">/A\</span>
            </div>
          </div>

          <div className="absolute bottom-12 left-12 right-12 text-left z-10 glass-panel p-6 rounded-2xl">
            <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
              <GlobalOutlined className="text-[#00F2FE]" /> Global Proximity Network
            </h2>
            <p className="text-sm text-white/70">
              Discover people, spontaneous meetups, and real-time stories happening right next to you. Supported with global OAuth access across US, EU, RU, and Asia.
            </p>
          </div>
        </div>

        {/* Right Side: Glassmorphic Auth Form */}
        <div className="w-full lg:w-2/5 flex items-center justify-center p-6 sm:p-12 relative">
          <div className="w-full max-w-md space-y-6">
            <div className="text-center space-y-2">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-[#00F2FE]/10 border border-[#00F2FE]/30 text-[#00F2FE] font-bold text-xl mb-2">
                /A\
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-white">
                Sign in to ahoj
              </h1>
              <p className="text-sm text-white/50">
                Use 1-click Demo Login or enter your credentials below
              </p>
            </div>

            {/* Instant Demo Login Button */}
            <button
              type="button"
              onClick={handleInstantDemoLogin}
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-[#00F2FE] to-[#00DCE6] text-black font-bold text-sm flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(0,242,254,0.4)] hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              <ThunderboltOutlined className="text-lg" />
              ⚡ Instant Demo Sign-In (@dev_user)
            </button>

            {/* Glass Container */}
            <div className="glass-panel p-6 sm:p-8 rounded-2xl space-y-6">
              <Form
                form={form}
                layout="vertical"
                onFinish={handleEmailLogin}
                requiredMark={false}
              >
                <Form.Item
                  name="email"
                  rules={[
                    { required: true, message: "Please input your email!" },
                    { type: "email", message: "Please enter a valid email!" },
                  ]}
                >
                  <Input
                    prefix={<UserOutlined className="text-white/40" />}
                    placeholder="Email address"
                    className="glass-input"
                  />
                </Form.Item>

                <Form.Item
                  name="password"
                  rules={[{ required: true, message: "Please input your password!" }]}
                >
                  <Input.Password
                    prefix={<LockOutlined className="text-white/40" />}
                    placeholder="Password"
                    className="glass-input"
                  />
                </Form.Item>

                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  block
                  className="bg-white/10 hover:bg-white/20 text-white font-semibold h-11 border border-white/10"
                >
                  Sign In with Email
                </Button>
              </Form>

              <Divider className="border-white/10 text-white/40 text-xs">
                Or continue with Global OAuth
              </Divider>

              {/* OAuth Provider Grid */}
              <OAuthProviderGrid
                onSelectProvider={handleOAuthLogin}
                loading={loading}
              />
            </div>

            <p className="text-center text-xs text-white/50">
              Don&apos;t have an account?{" "}
              <Link href="/register" className="text-[#00F2FE] hover:underline font-medium">
                Create one now
              </Link>
            </p>
          </div>
        </div>
      </div>
    </ThemeProvider>
  );
}
