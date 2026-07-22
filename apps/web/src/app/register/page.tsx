"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Form, Input, Button, App, Divider, DatePicker } from "antd";
import { UserOutlined, MailOutlined, LockOutlined } from "@ant-design/icons";
import { ThemeProvider } from "../../components/ThemeProvider";
import { OAuthProviderGrid, type OAuthProviderKey } from "../../components/OAuthProviderGrid";

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
    <div className="min-h-screen w-full flex bg-[#0C0C0C] text-white">
      {/* Left Side: Atmosphere */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-[#0C0C0C] via-[#0A192F] to-[#052930] items-center justify-center p-12 border-r border-white/10">
        <div className="relative w-80 h-80 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border border-[#00F2FE]/20 animate-radar" />
          <div className="absolute w-60 h-60 rounded-full border border-[#00F2FE]/30 animate-pulse" />
          <div className="w-20 h-20 rounded-full bg-[#00F2FE]/10 border border-[#00F2FE] flex items-center justify-center shadow-[0_0_30px_rgba(0,242,254,0.4)]">
            <span className="text-xl font-bold text-[#00F2FE]">/A\</span>
          </div>
        </div>
        <div className="absolute bottom-12 left-12 right-12 glass-panel p-6 rounded-2xl">
          <h3 className="text-xl font-bold text-white mb-1">Join the Radar</h3>
          <p className="text-xs text-white/70">
            Create an account with custom username, optional bio, avatar, or use one-click global OAuth providers.
          </p>
        </div>
      </div>

      {/* Right Side: Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative overflow-y-auto">
        <div className="w-full max-w-md space-y-6 my-auto">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-[#00F2FE]/10 border border-[#00F2FE]/30 text-[#00F2FE] font-bold text-xl mb-1">
              /A\
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white">
              Create your ahoj account
            </h1>
            <p className="text-sm text-white/50">
              Join nearby friends and local spontaneous meetups
            </p>
          </div>

          <div className="glass-panel p-6 sm:p-8 rounded-2xl space-y-6">
            <Form
              form={form}
              layout="vertical"
              onFinish={handleRegister}
              requiredMark={false}
            >
              <Form.Item
                name="username"
                rules={[
                  { required: true, message: "Username is required!" },
                  { pattern: /^[a-zA-Z0-9_]+$/, message: "Letters, numbers & underscores only!" },
                ]}
              >
                <Input
                  prefix={<UserOutlined className="text-white/40" />}
                  placeholder="Username (e.g. alex_24)"
                  className="glass-input"
                />
              </Form.Item>

              <Form.Item
                name="email"
                rules={[
                  { required: true, message: "Email is required!" },
                  { type: "email", message: "Valid email address required!" },
                ]}
              >
                <Input
                  prefix={<MailOutlined className="text-white/40" />}
                  placeholder="Email address"
                  className="glass-input"
                />
              </Form.Item>

              <Form.Item
                name="password"
                rules={[{ required: true, min: 8, message: "Min 8 characters required!" }]}
              >
                <Input.Password
                  prefix={<LockOutlined className="text-white/40" />}
                  placeholder="Password (8+ chars)"
                  className="glass-input"
                />
              </Form.Item>

              <Form.Item name="dateOfBirth" label={<span className="text-xs text-white/70">Date of Birth (Optional)</span>}>
                <DatePicker className="w-full glass-input" placeholder="Select your birth date" />
              </Form.Item>

              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                block
                className="bg-[#00F2FE] hover:bg-[#00DCE6] text-black font-semibold h-11 border-none shadow-[0_0_20px_rgba(0,242,254,0.3)] mt-2"
              >
                Create Account
              </Button>
            </Form>

            <Divider className="border-white/10 text-white/40 text-xs">
              Or Register with Global Identity
            </Divider>

            <OAuthProviderGrid
              onSelectProvider={handleOAuthRegister}
              loading={loading}
            />
          </div>

          <p className="text-center text-xs text-white/50">
            Already have an account?{" "}
            <Link href="/login" className="text-[#00F2FE] hover:underline font-medium">
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
