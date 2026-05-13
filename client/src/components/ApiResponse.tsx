import React from 'react';

interface ApiResponseProps {
  label: string;
  loading: boolean;
  error: any;
  data: any;
}

export const ApiResponse: React.FC<ApiResponseProps> = ({ label, loading, error, data }) => {
  if (!loading && !error && data === null) return null;

  return (
    <div className="api-response">
      <h4>{label}</h4>
      {loading && <div className="loading-indicator">⏳ Loading...</div>}
      {error && (
        <pre className="response-error">
          {JSON.stringify(error, null, 2)}
        </pre>
      )}
      {data !== null && !loading && (
        <pre className="response-success">
          {JSON.stringify(data, null, 2)}
        </pre>
      )}
    </div>
  );
};
