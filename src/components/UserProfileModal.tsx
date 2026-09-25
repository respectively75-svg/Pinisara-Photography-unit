import React, { useState } from 'react';
import { 
  X, 
  Heart, 
  Camera, 
  ShieldCheck, 
  Edit3, 
  Users,
  Smartphone
} from 'lucide-react';
import { UserProfile, Photo } from '../types';
import { CREATOR_TEAM } from '../data/mockData';

interface UserProfileModalProps {
  user: UserProfile;
  photos: Photo[];
  onUpdateProfile: (updated: UserProfile) => void;
  onSelectPhoto: (photo: Photo) => void;
  onClose: () => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  user,
  photos,
  onUpdateProfile,
  onSelectPhoto,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<'favorites' | 'team' | 'edit'>('team');
  const [displayName, setDisplayName] = useState(user.displayName);
  const [bio, setBio] = useState(user.bio);
  const [affiliation, setAffiliation] = useState(user.affiliation);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const favoritePhotos = photos.filter(p => user.favorites.includes(p.id) || p.isFavorited);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile({
      ...user,
      displayName,
      bio,
      affiliation
    });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  return (
    <div id="user-profile-modal" className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl w-full max-w-3xl max-h-[90vh] shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header Profile Banner */}
        <div className="relative bg-stone-900 px-6 pt-8 pb-6 text-white shrink-0">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
            <div className="relative">
              <img
                src={user.avatarUrl}
                alt={user.displayName}
                className="w-18 h-18 rounded-full object-cover ring-2 ring-white/30 shadow-md"
              />
              <span className="absolute bottom-0 right-0 p-1 rounded-full bg-emerald-500 ring-2 ring-stone-900 text-white">
                <ShieldCheck className="w-3.5 h-3.5" />
              </span>
            </div>

            <div className="text-center sm:text-left space-y-1">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h2 className="font-source-serif font-medium text-2xl tracking-tight text-white">
                  {user.displayName}
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-medium uppercase tracking-wider bg-white/10 text-stone-300 border border-white/20">
                  {user.role}
                </span>
              </div>
              <p className="text-xs text-stone-300 font-medium">
                {user.affiliation}
              </p>
              <p className="text-xs text-stone-400 max-w-md pt-1 leading-relaxed">
                {user.bio}
              </p>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-6 px-6 border-b border-stone-200 dark:border-stone-800 bg-stone-50/60 dark:bg-stone-950/60">
          <button
            id="profile-tab-team"
            onClick={() => setActiveTab('team')}
            className={`py-3 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'team'
                ? 'border-stone-900 text-stone-900 dark:border-white dark:text-white'
                : 'border-transparent text-stone-500 hover:text-stone-900 dark:hover:text-stone-300'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Creators & Gear ({CREATOR_TEAM.length})</span>
          </button>

          <button
            id="profile-tab-favorites"
            onClick={() => setActiveTab('favorites')}
            className={`py-3 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'favorites'
                ? 'border-stone-900 text-stone-900 dark:border-white dark:text-white'
                : 'border-transparent text-stone-500 hover:text-stone-900 dark:hover:text-stone-300'
            }`}
          >
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500/20" />
            <span>Saved Favorites ({favoritePhotos.length})</span>
          </button>

          <button
            id="profile-tab-edit"
            onClick={() => setActiveTab('edit')}
            className={`py-3 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'edit'
                ? 'border-stone-900 text-stone-900 dark:border-white dark:text-white'
                : 'border-transparent text-stone-500 hover:text-stone-900 dark:hover:text-stone-300'
            }`}
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Profile Settings</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="p-6 overflow-y-auto flex-1">
          
          {/* Creator Team View */}
          {activeTab === 'team' && (
            <div className="space-y-4">
              <div className="border-b border-stone-200 dark:border-stone-800 pb-3">
                <h4 className="font-source-serif font-medium text-base text-stone-900 dark:text-stone-100">
                  Student Photojournalism Team
                </h4>
                <p className="text-xs text-stone-500 dark:text-stone-400">
                  Documenting high school athletic championships, events, and decisive moments.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {CREATOR_TEAM.map((creator) => (
                  <div 
                    key={creator.id}
                    className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200/80 dark:border-stone-800 flex flex-col justify-between"
                  >
                    <div className="flex items-start gap-3">
                      <img 
                        src={creator.avatar} 
                        alt={creator.name} 
                        className="w-11 h-11 rounded-full object-cover ring-1 ring-stone-300 dark:ring-stone-700 shrink-0" 
                      />
                      <div className="min-w-0">
                        <h5 className="font-semibold text-xs sm:text-sm text-stone-900 dark:text-stone-100 truncate">
                          {creator.name}
                        </h5>
                        <p className="text-[11px] text-stone-500 font-mono">
                          {creator.handle}
                        </p>
                        <p className="text-[11px] text-stone-600 dark:text-stone-400 mt-1 line-clamp-2 leading-relaxed">
                          {creator.bio}
                        </p>
                      </div>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-stone-200 dark:border-stone-700/60 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5 text-stone-700 dark:text-stone-300 font-mono text-[11px]">
                        {creator.camera.includes('iPhone') || creator.camera.includes('Samsung') ? (
                          <Smartphone className="w-3.5 h-3.5 text-stone-500" />
                        ) : (
                          <Camera className="w-3.5 h-3.5 text-stone-500" />
                        )}
                        <span className="font-medium">{creator.camera}</span>
                      </div>
                      <span className="text-[10px] text-stone-400 font-mono">
                        {creator.photoCount} shots
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Favorites Tab */}
          {activeTab === 'favorites' && (
            <div>
              {favoritePhotos.length === 0 ? (
                <div className="py-12 text-center">
                  <Heart className="w-8 h-8 text-stone-300 mx-auto mb-2" />
                  <h4 className="font-source-serif font-medium text-sm text-stone-900 dark:text-stone-100">
                    No favorited photos yet
                  </h4>
                  <p className="text-xs text-stone-500 mt-1">
                    Click the heart icon on any photo in the gallery to collect your favorite moments.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {favoritePhotos.map((photo) => (
                    <div
                      key={photo.id}
                      onClick={() => onSelectPhoto(photo)}
                      className="group relative rounded-2xl overflow-hidden bg-stone-100 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 cursor-pointer hover:shadow-md transition-all"
                    >
                      <img
                        src={photo.webUrl}
                        alt={photo.title}
                        className="w-full h-36 object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="p-2.5">
                        <h5 className="font-source-serif font-medium text-xs text-stone-900 dark:text-stone-100 line-clamp-1">
                          {photo.title}
                        </h5>
                        <p className="text-[10px] text-stone-500 mt-0.5">
                          Photo by {photo.photographerName} · {photo.camera}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Edit Profile Tab */}
          {activeTab === 'edit' && (
            <form onSubmit={handleSave} className="space-y-4 max-w-xl">
              {saveSuccess && (
                <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2">
                  Profile updated successfully!
                </div>
              )}

              <div>
                <label className="text-xs font-semibold text-stone-800 dark:text-stone-200 block mb-1">
                  Display Name
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 border border-stone-200 dark:border-stone-700 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-stone-800 dark:text-stone-200 block mb-1">
                  Affiliation / Role
                </label>
                <input
                  type="text"
                  value={affiliation}
                  onChange={(e) => setAffiliation(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 border border-stone-200 dark:border-stone-700 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-stone-800 dark:text-stone-200 block mb-1">
                  Biography & Gear Notes
                </label>
                <textarea
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 border border-stone-200 dark:border-stone-700 focus:outline-none"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-stone-900 text-white text-xs font-semibold hover:bg-stone-800 dark:bg-white dark:text-stone-900 dark:hover:bg-stone-100 transition-colors"
                >
                  Save Changes
                </button>
              </div>
            </form>
          )}

        </div>

      </div>
    </div>
  );
};
