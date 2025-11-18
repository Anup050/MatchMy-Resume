import React from 'react';
import { FiCheckCircle, FiAlertCircle, FiInfo } from 'react-icons/fi';

const ATSCompatibility = ({ score }) => {
  // Normalize score: allow 0, treat undefined/null as null
  const hasScore = typeof score === 'number' && !Number.isNaN(score);
  const normalizedScore = hasScore ? Math.min(Math.max(score, 0), 100) : null;

  const getATSScoreColor = (val) => {
    if (val === null) return 'text-gray-500 bg-gray-100';
    if (val >= 80) return 'text-green-600 bg-green-50';
    if (val >= 60) return 'text-blue-600 bg-blue-50';
    return 'text-red-600 bg-red-50';
  };

  const getATSStatus = (val) => {
    if (val === null) return 'Not available';
    if (val >= 80) return 'Excellent';
    if (val >= 60) return 'Good';
    if (val >= 40) return 'Fair';
    return 'Poor';
  };

  const badgeClasses = getATSScoreColor(normalizedScore);
  const statusText = getATSStatus(normalizedScore);

  const tips = [
    {
      title: 'Use Standard Headings',
      description:
        'Replace creative section titles with standard ones like "Work Experience" and "Education".',
      icon: <FiCheckCircle className="text-green-500" />,
    },
    {
      title: 'Avoid Graphics & Tables',
      description: 'Remove complex layouts that scanners might misread.',
      icon: <FiAlertCircle className="text-yellow-500" />,
    },
    {
      title: 'Keyword Optimization',
      description: 'Include more relevant keywords from the job description naturally.',
      icon: <FiInfo className="text-blue-500" />,
    },
    {
      title: 'File Format',
      description: 'Use a simple, ATS-friendly format (PDF or DOCX as specified).',
      icon: <FiCheckCircle className="text-green-500" />,
    },
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center mb-4">
        <div className={`p-2 rounded-lg mr-3 ${badgeClasses}`}>
          <span className="font-bold">
            {normalizedScore !== null ? normalizedScore : 'N/A'}
          </span>
          {normalizedScore !== null && '/100'}
        </div>
        <div>
          <h3 className="text-lg font-medium text-gray-800">ATS Compatibility</h3>
          <p className="text-sm text-gray-500">
            {statusText}
            {normalizedScore !== null && (
              <>
                {' '}
                – {normalizedScore >= 60
                  ? 'Likely to pass screening'
                  : 'May have issues with scanners'}
              </>
            )}
          </p>
        </div>
      </div>

      <div className="space-y-3 mt-4">
        <h4 className="text-sm font-medium text-gray-700">Tips to Improve:</h4>
        {tips.map((tip, index) => (
          <div key={index} className="flex items-start p-3 bg-gray-50 rounded-lg">
            <div className="mr-3 mt-0.5">{tip.icon}</div>
            <div>
              <p className="font-medium text-gray-800">{tip.title}</p>
              <p className="text-sm text-gray-600">{tip.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ATSCompatibility;
