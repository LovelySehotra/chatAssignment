import React from 'react';
import { tokenStorage } from '../utils/tokenStorage';

interface TokenManagerProps {
  onLogout: () => void;
}

export const TokenManager: React.FC<TokenManagerProps> = ({ onLogout }) => {
  const token = tokenStorage.getAccessToken();
  const user = tokenStorage.getUser();

  return (
    <div className="token-manager">
      <h4>🔑 Auth Status</h4>
      {token ? (
        <>
          <p><strong>User:</strong> {user?.email || 'Unknown'}</p>
          <p><strong>ID:</strong> {user?._id || 'N/A'}</p>
          <p className="token-preview">
            <strong>Token:</strong> {token.substring(0, 30)}...
          </p>
          <button className="btn btn-danger" onClick={onLogout}>Logout (Clear Tokens)</button>
        </>
      ) : (
        <p className="text-muted">Not logged in. Use Auth page to login.</p>
      )}
    </div>
  );
};
