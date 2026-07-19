"use client";

import { useState, useEffect } from "react";
import { authClient } from "@/lib/auth-client";
import { Camera, Eye, EyeOff } from "lucide-react";

export default function UserProfilePage() {
  const { data: session, refetch } = authClient.useSession();
  const user = session?.user;

  const [name, setName] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");
  const [uploading, setUploading] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMessage, setProfileMessage] = useState("");
  const [profileError, setProfileError] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState("");
  const [passwordError, setPasswordError] = useState("");

  useEffect(() => {
    if (user?.name) setName(user.name);
  }, [user]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const uploadImageToImgBB = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("image", file);

    const res = await fetch(
      `https://api.imgbb.com/1/upload?key=${process.env.NEXT_PUBLIC_IMGBB_API_KEY}`,
      { method: "POST", body: formData }
    );

    const data = await res.json();
    if (!data.success) throw new Error("Image upload failed.");
    return data.data.url as string;
  };

  const saveProfile = async () => {
    setProfileError("");
    setProfileMessage("");

    if (!name.trim()) {
      setProfileError("Name cannot be empty.");
      return;
    }

    setSavingProfile(true);
    try {
      let imageUrl = user?.image || undefined;

      if (imageFile) {
        setUploading(true);
        imageUrl = await uploadImageToImgBB(imageFile);
        setUploading(false);
      }

      // Better Auth client-side profile update
      const { error } = await authClient.updateUser({
        name: name.trim(),
        image: imageUrl,
      });

      if (error) {
        setProfileError(error.message || "Failed to update profile.");
        return;
      }

      setProfileMessage("Profile updated successfully!");
      setImageFile(null);
      await refetch();
    } catch (err) {
      console.error(err);
      setProfileError("Something went wrong. Please try again.");
    } finally {
      setSavingProfile(false);
      setUploading(false);
    }
  };

  const changePassword = async () => {
    setPasswordError("");
    setPasswordMessage("");

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError("Please fill in all password fields.");
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError("New password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match.");
      return;
    }

    setChangingPassword(true);
    try {
      const { error } = await authClient.changePassword({
        currentPassword,
        newPassword,
        revokeOtherSessions: true,
      });

      if (error) {
        setPasswordError(error.message || "Failed to change password.");
        return;
      }

      setPasswordMessage("Password changed successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      console.error(err);
      setPasswordError("Something went wrong. Please try again.");
    } finally {
      setChangingPassword(false);
    }
  };

  if (!user) {
    return <div className="text-center text-slate-400 py-20">Please log in to view your profile.</div>;
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-black tracking-tight text-slate-900 mb-1">Edit Profile</h1>
      <p className="text-sm text-slate-400 mb-6">Update your personal information and password.</p>

      {/* Profile info card */}
      <div className="bg-white border border-slate-100 rounded-3xl shadow-sm p-6 mb-6">
        <h2 className="text-base font-bold text-slate-800 mb-5">Profile Information</h2>

        {/* Avatar */}
        <div className="flex items-center gap-5 mb-6">
          <div className="relative">
            <div className="h-20 w-20 rounded-full overflow-hidden bg-slate-100 border border-slate-200 flex items-center justify-center">
              {imagePreview || user.image ? (
                <img
                  src={imagePreview || user.image || ""}
                  alt={user.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="text-xl font-bold text-slate-400">
                  {user.name?.charAt(0)?.toUpperCase() || "U"}
                </span>
              )}
            </div>
            <label
              htmlFor="profileImage"
              className="absolute bottom-0 right-0 h-7 w-7 rounded-full bg-slate-800 flex items-center justify-center cursor-pointer border-2 border-white"
            >
              <Camera size={13} className="text-white" />
            </label>
            <input
              id="profileImage"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-800">{user.name}</p>
            <p className="text-xs text-slate-400 mt-0.5">{user.email}</p>
          </div>
        </div>

        {/* Name */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-400"
          />
        </div>

        {/* Email (read-only) */}
        <div className="mb-2">
          <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
          <input
            type="email"
            value={user.email}
            disabled
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-500 cursor-not-allowed"
          />
          <p className="text-xs text-slate-400 mt-1">Email cannot be changed.</p>
        </div>

        {profileError && <p className="text-xs text-red-500 mt-3">{profileError}</p>}
        {profileMessage && <p className="text-xs text-green-600 mt-3">{profileMessage}</p>}

        <button
          onClick={saveProfile}
          disabled={savingProfile}
          className="mt-4 px-6 py-2.5 rounded-xl bg-slate-800 text-white text-sm font-medium disabled:opacity-50 hover:bg-slate-900 transition"
        >
          {uploading ? "Uploading image..." : savingProfile ? "Saving..." : "Save Changes"}
        </button>
      </div>

      {/* Password card */}
      <div className="bg-white border border-slate-100 rounded-3xl shadow-sm p-6">
        <h2 className="text-base font-bold text-slate-800 mb-5">Change Password</h2>

        <div className="space-y-3">
          <div className="relative">
            <input
              type={showCurrentPassword ? "text" : "password"}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Current password"
              className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 pr-10 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-400"
            />
            <button
              type="button"
              onClick={() => setShowCurrentPassword(!showCurrentPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
            >
              {showCurrentPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          <div className="relative">
            <input
              type={showNewPassword ? "text" : "password"}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="New password"
              className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 pr-10 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-400"
            />
            <button
              type="button"
              onClick={() => setShowNewPassword(!showNewPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
            >
              {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          <input
            type={showNewPassword ? "text" : "password"}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm new password"
            className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-400"
          />
        </div>

        {passwordError && <p className="text-xs text-red-500 mt-3">{passwordError}</p>}
        {passwordMessage && <p className="text-xs text-green-600 mt-3">{passwordMessage}</p>}

        <button
          onClick={changePassword}
          disabled={changingPassword}
          className="mt-4 px-6 py-2.5 rounded-xl bg-slate-800 text-white text-sm font-medium disabled:opacity-50 hover:bg-slate-900 transition"
        >
          {changingPassword ? "Changing..." : "Change Password"}
        </button>
      </div>
    </div>
  );
}