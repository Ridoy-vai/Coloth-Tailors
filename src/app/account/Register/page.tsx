'use client';

import { authClient } from '@/lib/auth-client';
import Link from 'next/link';
import React, { useState } from 'react';

export default function RegisterPage() {

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        country: '',
        location: '',
        role: 'user', // UI-te thakbe na, console log e jabe
        profileImageUrl: '', // ImgBB uploaded link eikane save hobe
    });

    const [profileImage, setProfileImage] = useState<File | null>(null);
    const [showPassword, setShowPassword] = useState(false);
    const [isPasswordFocused, setIsPasswordFocused] = useState(false);
    const [isUploading, setIsUploading] = useState(false);

    // Real-time password check flags
    const hasLength = formData.password.length >= 6;
    const hasCapital = /[A-Z]/.test(formData.password);
    const hasSmall = /[a-z]/.test(formData.password);
    const isPasswordValid = hasLength && hasCapital && hasSmall;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { id, value } = e.target;
        setFormData((prev) => ({ ...prev, [id]: value }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setProfileImage(e.target.files[0]);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.name || !formData.email || !formData.password || !formData.country || !formData.location) {
            alert('Please fill out all fields.');
            return;
        }

        if (!isPasswordValid) {
            alert('Please satisfy all password validation rules.');
            return;
        }

        if (!profileImage) {
            alert('Please select a profile image.');
            return;
        }

        let uploadedImageUrl = '';
        setIsUploading(true);

        try {
            // Form Data preparation for ImgBB API
            const imageFormData = new FormData();
            imageFormData.append('image', profileImage);

            // --- CRITICAL: Apnar ImgBB API Key eikhane boshaben ---
            // Free key pete parben: https://api.imgbb.com/
            const IMGBB_API_KEY = process.env.NEXT_PUBLIC_IMGBB_API_KEY;

            if (!IMGBB_API_KEY) {
                throw new Error('ImgBB API key is not configured. Please add NEXT_PUBLIC_IMGBB_API_KEY to .env.local');
            }

            const response = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
                method: 'POST',
                body: imageFormData,
            });

            const result = await response.json();

            if (result.success) {
                uploadedImageUrl = result.data.url;
            } else {
                throw new Error(result.error?.message || 'ImgBB upload failed');
            }

            // Final Structured Data with ImgBB Link
            const finalSubmissionData = {
                ...formData,
                profileImageUrl: uploadedImageUrl
            };

            // better auth api call in registration
            const { data, error } = await authClient.signUp.email({
                name: finalSubmissionData.name,
                email: finalSubmissionData.email,
                password: finalSubmissionData.password,
                image: finalSubmissionData.profileImageUrl || "",
                callbackURL: "/",
            });

            if (error) {
                throw new Error(error.message || 'Registration failed');
            }

            // Console log dynamic response
            console.log('--- Registration Data Submitted ---');
            console.log('User:', data);

            // alert('Registration successful! Check console for the ImgBB link.');

            // Clear file after success
            setProfileImage(null);

        } catch (error) {
            console.error('Error uploading image:', error);
            alert('Image upload failed. Please ensure your ImgBB API key is valid.');
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="bg-slate-100 min-h-screen flex items-center justify-center p-4 antialiased font-sans">
            <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-4xl flex flex-col md:flex-row gap-8 items-center">

                {/* Left Side: Random Illustration Image */}
                <div className="w-full md:w-1/2 flex justify-center h-full min-h-[300px] md:min-h-[450px]">
                    <img
                        src="https://images.unsplash.com/photo-1586717791821-3f44a563fa4c?q=80&w=600&auto=format&fit=crop"
                        alt="Random Workplace Illustration"
                        className="w-full h-full object-cover rounded-2xl max-h-[500px]"
                    />
                </div>

                {/* Form Section */}
                <div className="w-full md:w-1/2">
                    <h2 className="text-3xl font-bold text-slate-800 mb-2">Create Account</h2>
                    <p className="text-slate-500 text-sm mb-6">Join us today! Please enter your details.</p>

                    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                        {/* Name Field */}
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1" htmlFor="name">Full Name</label>
                            <input
                                type="text"
                                id="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition text-slate-800"
                                placeholder="John Doe"
                            />
                        </div>

                        {/* Email Field */}
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1" htmlFor="email">Email Address</label>
                            <input
                                type="email"
                                id="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition text-slate-800"
                                placeholder="example@mail.com"
                            />
                        </div>

                        {/* Password Field with Toggle & Focus-based Validation */}
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1" htmlFor="password">Password</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    id="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    onFocus={() => setIsPasswordFocused(true)}
                                    onBlur={() => setIsPasswordFocused(false)}
                                    required
                                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition text-slate-800"
                                    placeholder="••••••••"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 focus:outline-none"
                                >
                                    {showPassword ? (
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 11-4.243-4.243m4.242 4.242L9.88 9.88" />
                                        </svg>
                                    ) : (
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                    )}
                                </button>
                            </div>

                            {/* Validation rules popup when typing/focusing */}
                            {(isPasswordFocused || formData.password.length > 0) && (
                                <div className="mt-2 text-xs space-y-1 bg-slate-50 p-2 rounded border border-slate-200 transition-all duration-300">
                                    <p className={`flex items-center gap-1.5 ${hasLength ? 'text-green-600' : 'text-red-500'}`}>
                                        <span>{hasLength ? '✓' : '✗'}</span> Minimum 6 characters
                                    </p>
                                    <p className={`flex items-center gap-1.5 ${hasCapital ? 'text-green-600' : 'text-red-500'}`}>
                                        <span>{hasCapital ? '✓' : '✗'}</span> At least 1 capital letter (A-Z)
                                    </p>
                                    <p className={`flex items-center gap-1.5 ${hasSmall ? 'text-green-600' : 'text-red-500'}`}>
                                        <span>{hasSmall ? '✓' : '✗'}</span> At least 1 small letter (a-z)
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Profile Image Upload Input */}
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1" htmlFor="profileImage">Upload Profile Picture</label>
                            <input
                                type="file"
                                id="profileImage"
                                accept="image/*"
                                onChange={handleFileChange}
                                className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 transition cursor-pointer"
                            />
                        </div>

                        {/* Country & Location */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1" htmlFor="country">Country</label>
                                <select
                                    id="country"
                                    value={formData.country}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-2 border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition text-slate-800"
                                >
                                    <option value="">Select</option>
                                    <option value="Bangladesh">Bangladesh</option>
                                    <option value="USA">USA</option>
                                    <option value="UK">UK</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1" htmlFor="location">Location</label>
                                <input
                                    type="text"
                                    id="location"
                                    value={formData.location}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition text-slate-800"
                                    placeholder="City name"
                                />
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isUploading}
                            className="w-full bg-indigo-600 text-white font-semibold py-2.5 rounded-lg hover:bg-indigo-700 transition duration-200 shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isUploading ? 'Uploading Image...' : 'Sign Up'}
                        </button>
                    </form>

                    {/* Divider */}
                    <div className="relative flex py-5 items-center">
                        <div className="flex-grow border-t border-slate-300"></div>
                        <span className="flex-shrink mx-4 text-slate-400 text-sm">Or continue with</span>
                        <div className="flex-grow border-t border-slate-300"></div>
                    </div>

                    {/* Social Logins */}
                    <div className="grid grid-cols-2 gap-4">
                        <button
                            type="button"
                            onClick={() => console.log('Google Auth Triggered')}
                            className="flex items-center justify-center gap-2 border border-slate-300 rounded-lg py-2 hover:bg-slate-50 transition font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-200"
                        >
                            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
                            </svg>
                            Google
                        </button>
                        <button
                            type="button"
                            onClick={() => console.log('Facebook Auth Triggered')}
                            className="flex items-center justify-center gap-2 border border-slate-300 rounded-lg py-2 hover:bg-slate-50 transition font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-200"
                        >
                            <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.8c4.56-.93 8-4.96 8-9.8z" />
                            </svg>
                            Facebook
                        </button>
                    </div>
                    <p className="text-center text-sm text-slate-500 mt-6">
                        Already have an account?{' '}
                        <Link href="/account/login" className="font-semibold text-indigo-600 hover:text-indigo-700 transition">Sign in</Link>
                    </p>

                </div>
            </div>
        </div>
    );
}